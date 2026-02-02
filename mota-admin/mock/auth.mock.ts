/**
 * 认证授权Mock数据
 * 支持Umi框架的Mock数据格式
 */

// 登录接口 Mock
export async function postAuthLogin(req: any, res: any) {
  const { username, password } = req.body;

  // 简单的模拟登录逻辑 - 接受任意用户名和密码
  if (username && password) {
    // 模拟登录成功
    res.status(200).json({
      code: 0,
      message: '登录成功',
      data: {
        token: 'mock_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 7200,
        userId: '1',
        username: username,
        name: username === 'admin' ? '管理员' : '用户',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WhxQlqtJzGqDMRgUUAlb.png',
        role: 'admin',
      },
    });
  } else {
    res.status(400).json({
      code: 400,
      message: '用户名和密码不能为空',
    });
  }
}

// 获取当前用户信息接口
export async function getAuthCurrentUser(req: any, res: any) {
  res.status(200).json({
    code: 0,
    message: '获取成功',
    data: {
      userId: '1',
      username: 'admin',
      name: '管理员',
      email: 'admin@mota.com',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WhxQlqtJzGqDMRgUUAlb.png',
      role: 'admin',
      permissions: ['*:*:*'],
      createTime: '2026-01-01 00:00:00',
      updateTime: '2026-02-02 06:00:00',
    },
  });
}

// 用户登出接口
export async function postAuthLogout(req: any, res: any) {
  res.status(200).json({
    code: 0,
    message: '登出成功',
    data: {
      success: true,
    },
  });
}

// 刷新Token接口
export async function postAuthRefreshToken(req: any, res: any) {
  res.status(200).json({
    code: 0,
    message: '刷新成功',
    data: {
      token: 'mock_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 7200,
    },
  });
}

// 验证Token接口
export async function getAuthValidateToken(req: any, res: any) {
  res.status(200).json({
    code: 0,
    message: '验证成功',
    data: {
      valid: true,
    },
  });
}

// 修改密码接口
export async function postAuthChangePassword(req: any, res: any) {
  res.status(200).json({
    code: 0,
    message: '密码修改成功',
    data: {
      success: true,
    },
  });
}

// Umi Mock 路由配置
// 注意：请求时会添加 baseURL (http://localhost:8080/api/v1)
// 所以 Mock 路由应该匹配完整路径或使用代理配置
export default {
  'POST /api/v1/auth/login': postAuthLogin,
  'GET /api/v1/auth/current-user': getAuthCurrentUser,
  'POST /api/v1/auth/logout': postAuthLogout,
  'POST /api/v1/auth/refresh-token': postAuthRefreshToken,
  'GET /api/v1/auth/validate-token': getAuthValidateToken,
  'POST /api/v1/auth/change-password': postAuthChangePassword,
};