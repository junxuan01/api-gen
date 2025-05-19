import axios from 'axios';

/**
 * order-service API 服务的Axios实例
 */
const instance = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在此处添加认证令牌等逻辑
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 直接返回数据部分
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      console.error(`请求错误: ${error.response.status}`, error.response.data);
      
      // 处理特定状态码
      if (error.response.status === 401) {
        // 未授权处理，例如重定向到登录页
        console.error('认证失败，请重新登录');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // 请求发出但未收到响应
      console.error('请求超时或网络错误');
    } else {
      // 设置请求时发生错误
      console.error('请求配置错误', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default instance;