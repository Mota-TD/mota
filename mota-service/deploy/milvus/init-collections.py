#!/usr/bin/env python3
"""
Milvus向量集合初始化脚本
用于创建Mota平台所需的所有向量集合
"""

import os
import sys
import time
from pymilvus import (
    connections,
    utility,
    Collection,
    CollectionSchema,
    FieldSchema,
    DataType,
)

# 配置
MILVUS_HOST = os.getenv("MILVUS_HOST", "milvus")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")
MILVUS_USER = os.getenv("MILVUS_USER", "")
MILVUS_PASSWORD = os.getenv("MILVUS_PASSWORD", "")

# 向量维度配置
EMBEDDING_DIM = 1536  # OpenAI text-embedding-ada-002
EMBEDDING_DIM_SMALL = 768  # 较小的嵌入模型


def wait_for_milvus():
    """等待Milvus服务就绪"""
    print("等待Milvus服务就绪...")
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            connections.connect(
                alias="default",
                host=MILVUS_HOST,
                port=MILVUS_PORT,
                user=MILVUS_USER,
                password=MILVUS_PASSWORD,
            )
            print("Milvus服务已就绪")
            return True
        except Exception as e:
            print(f"等待Milvus... ({attempt + 1}/{max_attempts})")
            time.sleep(5)
    
    print("错误: Milvus服务未就绪，超时退出")
    return False


def create_collection(name, schema, description, index_params=None):
    """创建集合"""
    print(f"创建集合: {name}")
    
    if utility.has_collection(name):
        print(f"  集合 {name} 已存在，跳过创建")
        return Collection(name)
    
    collection = Collection(
        name=name,
        schema=schema,
        description=description,
    )
    
    # 创建索引
    if index_params:
        for field_name, params in index_params.items():
            print(f"  创建索引: {field_name}")
            collection.create_index(
                field_name=field_name,
                index_params=params,
            )
    
    print(f"  集合 {name} 创建成功")
    return collection


def create_knowledge_vectors_collection():
    """创建知识库向量集合"""
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, max_length=64, is_primary=True),
        FieldSchema(name="tenant_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="file_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="chunk_index", dtype=DataType.INT64),
        FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=65535),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM),
        FieldSchema(name="metadata", dtype=DataType.VARCHAR, max_length=4096),
        FieldSchema(name="created_at", dtype=DataType.INT64),
    ]
    
    schema = CollectionSchema(
        fields=fields,
        description="知识库文档向量集合",
        enable_dynamic_field=True,
    )
    
    index_params = {
        "embedding": {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 1024},
        }
    }
    
    return create_collection(
        name="mota_knowledge_vectors",
        schema=schema,
        description="知识库文档向量集合",
        index_params=index_params,
    )


def create_news_vectors_collection():
    """创建新闻向量集合"""
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, max_length=64, is_primary=True),
        FieldSchema(name="news_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=1024),
        FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="industry", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM),
        FieldSchema(name="publish_time", dtype=DataType.INT64),
        FieldSchema(name="created_at", dtype=DataType.INT64),
    ]
    
    schema = CollectionSchema(
        fields=fields,
        description="新闻向量集合",
        enable_dynamic_field=True,
    )
    
    index_params = {
        "embedding": {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 512},
        }
    }
    
    return create_collection(
        name="mota_news_vectors",
        schema=schema,
        description="新闻向量集合",
        index_params=index_params,
    )


def create_chat_history_vectors_collection():
    """创建对话历史向量集合"""
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, max_length=64, is_primary=True),
        FieldSchema(name="tenant_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="user_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="session_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="role", dtype=DataType.VARCHAR, max_length=32),
        FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=32768),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM),
        FieldSchema(name="created_at", dtype=DataType.INT64),
    ]
    
    schema = CollectionSchema(
        fields=fields,
        description="对话历史向量集合",
        enable_dynamic_field=True,
    )
    
    index_params = {
        "embedding": {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 512},
        }
    }
    
    return create_collection(
        name="mota_chat_history_vectors",
        schema=schema,
        description="对话历史向量集合",
        index_params=index_params,
    )


def create_task_vectors_collection():
    """创建任务向量集合（用于智能任务推荐）"""
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, max_length=64, is_primary=True),
        FieldSchema(name="tenant_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="project_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="task_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=1024),
        FieldSchema(name="description", dtype=DataType.VARCHAR, max_length=16384),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM),
        FieldSchema(name="status", dtype=DataType.VARCHAR, max_length=32),
        FieldSchema(name="created_at", dtype=DataType.INT64),
    ]
    
    schema = CollectionSchema(
        fields=fields,
        description="任务向量集合",
        enable_dynamic_field=True,
    )
    
    index_params = {
        "embedding": {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 512},
        }
    }
    
    return create_collection(
        name="mota_task_vectors",
        schema=schema,
        description="任务向量集合",
        index_params=index_params,
    )


def create_proposal_vectors_collection():
    """创建方案向量集合"""
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, max_length=64, is_primary=True),
        FieldSchema(name="tenant_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="proposal_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="section_index", dtype=DataType.INT64),
        FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=1024),
        FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=65535),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM),
        FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="created_at", dtype=DataType.INT64),
    ]
    
    schema = CollectionSchema(
        fields=fields,
        description="方案向量集合",
        enable_dynamic_field=True,
    )
    
    index_params = {
        "embedding": {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 512},
        }
    }
    
    return create_collection(
        name="mota_proposal_vectors",
        schema=schema,
        description="方案向量集合",
        index_params=index_params,
    )


def create_user_preference_vectors_collection():
    """创建用户偏好向量集合（用于个性化推荐）"""
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, max_length=64, is_primary=True),
        FieldSchema(name="tenant_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="user_id", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="preference_type", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM_SMALL),
        FieldSchema(name="weight", dtype=DataType.FLOAT),
        FieldSchema(name="updated_at", dtype=DataType.INT64),
    ]
    
    schema = CollectionSchema(
        fields=fields,
        description="用户偏好向量集合",
        enable_dynamic_field=True,
    )
    
    index_params = {
        "embedding": {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 256},
        }
    }
    
    return create_collection(
        name="mota_user_preference_vectors",
        schema=schema,
        description="用户偏好向量集合",
        index_params=index_params,
    )


def main():
    """主函数"""
    print("=" * 50)
    print("开始创建Milvus向量集合")
    print("=" * 50)
    
    # 等待Milvus就绪
    if not wait_for_milvus():
        sys.exit(1)
    
    try:
        # 创建各个集合
        print("\n>>> 创建知识库向量集合...")
        create_knowledge_vectors_collection()
        
        print("\n>>> 创建新闻向量集合...")
        create_news_vectors_collection()
        
        print("\n>>> 创建对话历史向量集合...")
        create_chat_history_vectors_collection()
        
        print("\n>>> 创建任务向量集合...")
        create_task_vectors_collection()
        
        print("\n>>> 创建方案向量集合...")
        create_proposal_vectors_collection()
        
        print("\n>>> 创建用户偏好向量集合...")
        create_user_preference_vectors_collection()
        
        # 列出所有集合
        print("\n" + "=" * 50)
        print("Milvus向量集合创建完成")
        print("=" * 50)
        
        print("\n当前所有集合:")
        collections = utility.list_collections()
        for coll_name in collections:
            coll = Collection(coll_name)
            print(f"  - {coll_name}: {coll.description}")
            print(f"    字段: {[f.name for f in coll.schema.fields]}")
            print(f"    实体数: {coll.num_entities}")
        
    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)
    finally:
        connections.disconnect("default")


if __name__ == "__main__":
    main()