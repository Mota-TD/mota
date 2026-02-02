/**
 * @see https://umijs.org/docs/max/access#access
 * Mota Admin 权限配置
 */
export default function access(initialState: {
  currentUser?: API.CurrentUser | undefined;
}) {
  const { currentUser } = initialState ?? {};

  return {
    // 管理员权限（超级管理员）
    canAdmin: currentUser && currentUser.access === 'admin',

    // 查看租户权限（超级管理员、运营管理员）
    canViewTenant:
      currentUser && ['admin', 'operator'].includes(currentUser.access || ''),

    // 查看用户权限（超级管理员、运营管理员、客服）
    canViewUser:
      currentUser &&
      ['admin', 'operator', 'support'].includes(currentUser.access || ''),

    // 查看内容权限（超级管理员、运营管理员）
    canViewContent:
      currentUser && ['admin', 'operator'].includes(currentUser.access || ''),

    // 查看AI管理权限（超级管理员）
    canViewAI: currentUser && currentUser.access === 'admin',

    // 查看系统管理权限（超级管理员、技术运维）
    canViewSystem:
      currentUser && ['admin', 'ops'].includes(currentUser.access || ''),

    // 查看数据分析权限（超级管理员、数据分析师）
    canViewAnalysis:
      currentUser && ['admin', 'analyst'].includes(currentUser.access || ''),
  };
}
