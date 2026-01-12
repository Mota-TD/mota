#!/bin/bash
# Elasticsearch索引模板初始化脚本
# 用于创建Mota平台所需的所有索引模板

set -e

# 配置
ES_HOST="${ES_HOST:-elasticsearch:9200}"
ES_USER="${ES_USER:-elastic}"
ES_PASSWORD="${ES_PASSWORD:-mota123456}"

# 等待Elasticsearch就绪
echo "等待Elasticsearch服务就绪..."
max_attempts=30
attempt=0
while ! curl -s -u "$ES_USER:$ES_PASSWORD" "http://$ES_HOST/_cluster/health" > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "错误: Elasticsearch服务未就绪，超时退出"
        exit 1
    fi
    echo "等待Elasticsearch... ($attempt/$max_attempts)"
    sleep 5
done
echo "Elasticsearch服务已就绪"

# 创建索引模板的函数
create_template() {
    local template_name=$1
    local template_body=$2
    
    echo "创建索引模板: $template_name"
    
    response=$(curl -s -X PUT -u "$ES_USER:$ES_PASSWORD" \
        "http://$ES_HOST/_index_template/$template_name" \
        -H "Content-Type: application/json" \
        -d "$template_body")
    
    if echo "$response" | grep -q '"acknowledged":true'; then
        echo "  模板 $template_name 创建成功"
    else
        echo "  模板 $template_name 创建失败: $response"
    fi
}

# 创建ILM策略的函数
create_ilm_policy() {
    local policy_name=$1
    local policy_body=$2
    
    echo "创建ILM策略: $policy_name"
    
    response=$(curl -s -X PUT -u "$ES_USER:$ES_PASSWORD" \
        "http://$ES_HOST/_ilm/policy/$policy_name" \
        -H "Content-Type: application/json" \
        -d "$policy_body")
    
    if echo "$response" | grep -q '"acknowledged":true'; then
        echo "  策略 $policy_name 创建成功"
    else
        echo "  策略 $policy_name 创建失败: $response"
    fi
}

echo "=========================================="
echo "开始创建Elasticsearch索引模板和ILM策略"
echo "=========================================="

# ==================== ILM策略 ====================
echo ""
echo ">>> 创建ILM生命周期策略..."

# 日志数据策略（30天热数据，90天温数据，365天后删除）
create_ilm_policy "mota-logs-policy" '{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "7d",
            "max_size": "50gb"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "30d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "90d",
        "actions": {
          "set_priority": {
            "priority": 0
          }
        }
      },
      "delete": {
        "min_age": "365d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

# 搜索数据策略（保留更长时间）
create_ilm_policy "mota-search-policy" '{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "30d",
            "max_size": "100gb"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "90d",
        "actions": {
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "delete": {
        "min_age": "730d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

# 审计日志策略（保留3年）
create_ilm_policy "mota-audit-policy" '{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "30d",
            "max_size": "50gb"
          }
        }
      },
      "warm": {
        "min_age": "90d",
        "actions": {
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "cold": {
        "min_age": "365d",
        "actions": {}
      },
      "delete": {
        "min_age": "1095d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

# ==================== 索引模板 ====================
echo ""
echo ">>> 创建索引模板..."

# 项目搜索索引模板
create_template "mota-projects" '{
  "index_patterns": ["mota-projects-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "mota-search-policy",
      "index.lifecycle.rollover_alias": "mota-projects",
      "analysis": {
        "analyzer": {
          "ik_smart_pinyin": {
            "type": "custom",
            "tokenizer": "ik_smart",
            "filter": ["lowercase"]
          },
          "ik_max_pinyin": {
            "type": "custom",
            "tokenizer": "ik_max_word",
            "filter": ["lowercase"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "tenant_id": { "type": "keyword" },
        "name": { 
          "type": "text",
          "analyzer": "ik_max_pinyin",
          "search_analyzer": "ik_smart_pinyin",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "description": { 
          "type": "text",
          "analyzer": "ik_max_pinyin"
        },
        "status": { "type": "keyword" },
        "owner_id": { "type": "keyword" },
        "owner_name": { "type": "keyword" },
        "members": { "type": "keyword" },
        "tags": { "type": "keyword" },
        "start_date": { "type": "date" },
        "end_date": { "type": "date" },
        "created_at": { "type": "date" },
        "updated_at": { "type": "date" }
      }
    }
  }
}'

# 任务搜索索引模板
create_template "mota-tasks" '{
  "index_patterns": ["mota-tasks-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 6,
      "number_of_replicas": 1,
      "index.lifecycle.name": "mota-search-policy",
      "index.lifecycle.rollover_alias": "mota-tasks",
      "analysis": {
        "analyzer": {
          "ik_smart_pinyin": {
            "type": "custom",
            "tokenizer": "ik_smart",
            "filter": ["lowercase"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "tenant_id": { "type": "keyword" },
        "project_id": { "type": "keyword" },
        "project_name": { "type": "keyword" },
        "title": { 
          "type": "text",
          "analyzer": "ik_smart_pinyin",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "description": { 
          "type": "text",
          "analyzer": "ik_smart_pinyin"
        },
        "status": { "type": "keyword" },
        "priority": { "type": "keyword" },
        "assignee_id": { "type": "keyword" },
        "assignee_name": { "type": "keyword" },
        "reporter_id": { "type": "keyword" },
        "tags": { "type": "keyword" },
        "due_date": { "type": "date" },
        "completed_at": { "type": "date" },
        "created_at": { "type": "date" },
        "updated_at": { "type": "date" }
      }
    }
  }
}'

# 知识库文档索引模板
create_template "mota-knowledge" '{
  "index_patterns": ["mota-knowledge-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "mota-search-policy",
      "index.lifecycle.rollover_alias": "mota-knowledge",
      "analysis": {
        "analyzer": {
          "ik_smart_pinyin": {
            "type": "custom",
            "tokenizer": "ik_smart",
            "filter": ["lowercase"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "tenant_id": { "type": "keyword" },
        "title": { 
          "type": "text",
          "analyzer": "ik_smart_pinyin",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "content": { 
          "type": "text",
          "analyzer": "ik_smart_pinyin"
        },
        "summary": { "type": "text" },
        "file_type": { "type": "keyword" },
        "file_size": { "type": "long" },
        "category": { "type": "keyword" },
        "tags": { "type": "keyword" },
        "author_id": { "type": "keyword" },
        "author_name": { "type": "keyword" },
        "view_count": { "type": "integer" },
        "created_at": { "type": "date" },
        "updated_at": { "type": "date" }
      }
    }
  }
}'

# 新闻索引模板
create_template "mota-news" '{
  "index_patterns": ["mota-news-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "mota-search-policy",
      "index.lifecycle.rollover_alias": "mota-news"
    },
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "title": { 
          "type": "text",
          "analyzer": "ik_smart",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "content": { "type": "text", "analyzer": "ik_smart" },
        "summary": { "type": "text" },
        "source": { "type": "keyword" },
        "source_url": { "type": "keyword" },
        "category": { "type": "keyword" },
        "tags": { "type": "keyword" },
        "industry": { "type": "keyword" },
        "publish_time": { "type": "date" },
        "created_at": { "type": "date" }
      }
    }
  }
}'

# 用户索引模板
create_template "mota-users" '{
  "index_patterns": ["mota-users-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1
    },
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "tenant_id": { "type": "keyword" },
        "username": { 
          "type": "text",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "nickname": { 
          "type": "text",
          "analyzer": "ik_smart",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "email": { "type": "keyword" },
        "phone": { "type": "keyword" },
        "department": { "type": "keyword" },
        "position": { "type": "keyword" },
        "status": { "type": "keyword" },
        "created_at": { "type": "date" }
      }
    }
  }
}'

# 操作日志索引模板
create_template "mota-operation-logs" '{
  "index_patterns": ["mota-operation-logs-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "mota-audit-policy",
      "index.lifecycle.rollover_alias": "mota-operation-logs"
    },
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "tenant_id": { "type": "keyword" },
        "user_id": { "type": "keyword" },
        "username": { "type": "keyword" },
        "operation": { "type": "keyword" },
        "module": { "type": "keyword" },
        "method": { "type": "keyword" },
        "request_url": { "type": "keyword" },
        "request_method": { "type": "keyword" },
        "request_params": { "type": "text" },
        "response_code": { "type": "integer" },
        "response_time": { "type": "long" },
        "ip": { "type": "ip" },
        "user_agent": { "type": "text" },
        "status": { "type": "keyword" },
        "error_message": { "type": "text" },
        "created_at": { "type": "date" }
      }
    }
  }
}'

# 应用日志索引模板
create_template "mota-app-logs" '{
  "index_patterns": ["mota-app-logs-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "mota-logs-policy",
      "index.lifecycle.rollover_alias": "mota-app-logs"
    },
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "logger": { "type": "keyword" },
        "thread": { "type": "keyword" },
        "message": { "type": "text" },
        "stack_trace": { "type": "text" },
        "service": { "type": "keyword" },
        "instance": { "type": "keyword" },
        "trace_id": { "type": "keyword" },
        "span_id": { "type": "keyword" },
        "tenant_id": { "type": "keyword" },
        "user_id": { "type": "keyword" }
      }
    }
  }
}'

# 搜索日志索引模板
create_template "mota-search-logs" '{
  "index_patterns": ["mota-search-logs-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "index.lifecycle.name": "mota-logs-policy",
      "index.lifecycle.rollover_alias": "mota-search-logs"
    },
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "tenant_id": { "type": "keyword" },
        "user_id": { "type": "keyword" },
        "query": { "type": "text" },
        "query_type": { "type": "keyword" },
        "result_count": { "type": "integer" },
        "response_time": { "type": "long" },
        "clicked_results": { "type": "keyword" },
        "created_at": { "type": "date" }
      }
    }
  }
}'

echo ""
echo "=========================================="
echo "Elasticsearch索引模板创建完成"
echo "=========================================="

# 创建初始索引别名
echo ""
echo ">>> 创建初始索引和别名..."

# 创建初始索引
for index in projects tasks knowledge news users operation-logs app-logs search-logs; do
    echo "创建索引: mota-$index-000001"
    curl -s -X PUT -u "$ES_USER:$ES_PASSWORD" \
        "http://$ES_HOST/mota-$index-000001" \
        -H "Content-Type: application/json" \
        -d "{
            \"aliases\": {
                \"mota-$index\": {
                    \"is_write_index\": true
                }
            }
        }" > /dev/null
done

echo ""
echo "当前所有索引模板:"
curl -s -u "$ES_USER:$ES_PASSWORD" "http://$ES_HOST/_index_template" | python3 -c "import sys,json; print('\n'.join(json.load(sys.stdin).get('index_templates', [])))" 2>/dev/null || echo "(需要python3解析)"

echo ""
echo "当前所有索引:"
curl -s -u "$ES_USER:$ES_PASSWORD" "http://$ES_HOST/_cat/indices?v"