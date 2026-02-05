// Admin Configuration Script
class AdminConfig {
    static async initializeAdmin() {
        try {
            // 获取保存的管理员配置
            const config = localStorage.getItem('adtonx_admin_config');
            if (!config) return false;
            
            const parsedConfig = JSON.parse(config);
            
            // 设置当前用户为管理员
            if (AdTONX.user && AdTONX.user.telegram_id === parsedConfig.adminId) {
                AdTONX.user.isAdmin = true;
                
                // 保存到数据库
                await window.firebaseService?.adminUpdateUser?.(AdTONX.user.telegram_id, {
                    isAdmin: true,
                    status: 'active'
                });
                
                console.log('Admin privileges granted to:', AdTONX.user.telegram_id);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Admin initialization error:', error);
            return false;
        }
    }
    
    static async checkAdminAccess() {
        // 检查用户是否为管理员
        if (!AdTONX.user || !AdTONX.user.isAdmin) {
            const config = localStorage.getItem('adtonx_admin_config');
            if (config) {
                const parsedConfig = JSON.parse(config);
                return AdTONX.user?.telegram_id === parsedConfig.adminId;
            }
        }
        return !!AdTONX.user?.isAdmin;
    }
    
    static getConfig() {
        try {
            const config = localStorage.getItem('adtonx_admin_config');
            return config ? JSON.parse(config) : null;
        } catch {
            return null;
        }
    }
    
    static updateConfig(updates) {
        try {
            const current = this.getConfig() || {};
            const newConfig = { ...current, ...updates };
            localStorage.setItem('adtonx_admin_config', JSON.stringify(newConfig));
            return true;
        } catch (error) {
            console.error('Config update error:', error);
            return false;
        }
    }
}

window.AdminConfig = AdminConfig;