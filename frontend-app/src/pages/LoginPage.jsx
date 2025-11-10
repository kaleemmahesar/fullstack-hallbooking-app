import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Card, Typography, message } from 'antd';
import * as api from '../api/mockApi';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Call the new login API
      const response = await api.login({
        username: values.username,
        password: values.password
      });
      
      // Successful login
      message.success('Login successful!');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate(from, { replace: true });
    } catch (error) {
      // Failed login
      message.error(error.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  // Prevent form submission on Enter key press in input fields
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <Title level={2} className="text-gray-800">Wedding Hall Manager</Title>
        </div>

        <Card className="shadow-lg rounded-xl border-0">
          <Title level={4} className="text-center mb-6">Login to your account</Title>
          
          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="Enter username" 
                size="large"
                onPressEnter={(e) => e.preventDefault()}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter password"
                size="large"
                onPressEnter={(e) => e.preventDefault()}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                size="large"
                loading={loading}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <Text strong>Default Credentials:</Text>
            <br />
            <Text type="secondary">Username: admin</Text>
            <br />
            <Text type="secondary">Password: password</Text>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Text type="secondary">© {new Date().getFullYear()} Wedding Hall Management System</Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;