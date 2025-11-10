"use client";

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Table,
  Progress,
  Tag,
  Select,
  DatePicker,
  Button,
  Statistic,
  Avatar,
  Rate,
  Space,
  Input,
  Badge,
  Menu,
  Dropdown,
  Divider,
  Spin,
  message,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  SearchOutlined,
  DownloadOutlined,
  StarOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Header, Content, Footer } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

// API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbwVuuQz9lQCPnMUOwztDrLyzlgCa9rtoh4-X6qqA7fgsz3vF-T-WeLwwFeXSB3wRrsr/exec';

// Interface cho dữ liệu từ API
interface ApiInternData {
  id: number;
  name: string;
  department: string;
  start_date: string;
  avg_score: string;
  status: string;
  feedback: string;
}

// Interface cho dữ liệu hiển thị
interface InternData {
  key: string;
  id: number;
  name: string;
  avatar: string;
  department: string;
  mentor: string;
  startDate: string;
  duration: string;
  progress: number;
  rating: number;
  status: string;
  tasksCompleted: number;
  totalTasks: number;
  attendance: number;
  feedback: string;
}

export default function InternEvaluationPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [internData, setInternData] = useState<InternData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Hàm chuyển đổi status từ API sang format hiển thị
  const normalizeStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'excellent': 'excellent',
      'outstanding': 'excellent',
      'good': 'good',
      'average': 'average',
      'needs improvement': 'needs_improvement',
      'poor': 'needs_improvement',
    };
    return statusMap[status.toLowerCase()] || 'average';
  };

  // Hàm tính rating từ avg_score (giả sử avg_score là ngày, ta sẽ dùng logic khác)
  const calculateRating = (status: string): number => {
    const statusRating: { [key: string]: number } = {
      'excellent': 5.0,
      'outstanding': 5.0,
      'good': 4.0,
      'average': 3.0,
      'needs improvement': 2.5,
      'poor': 2.0,
    };
    return statusRating[status.toLowerCase()] || 3.0;
  };

  // Hàm tính progress từ rating
  const calculateProgress = (rating: number): number => {
    return Math.round((rating / 5.0) * 100);
  };

  // Hàm tính số ngày từ start_date
  const calculateDuration = (startDate: string): string => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    return `${months} tháng`;
  };

  // Format ngày
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch dữ liệu từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: ApiInternData[] = await response.json();

      // Chuyển đổi dữ liệu từ API sang format hiển thị
      const transformedData: InternData[] = data.map((item, index) => {
        const rating = calculateRating(item.status);
        const progress = calculateProgress(rating);
        const normalizedStatus = normalizeStatus(item.status);

        return {
          key: String(item.id),
          id: item.id,
          name: item.name,
          avatar: `https://i.pravatar.cc/150?img=${item.id}`,
          department: item.department,
          mentor: `Mentor ${index + 1}`, // Vì API không có mentor, ta tạo tạm
          startDate: formatDate(item.start_date),
          duration: calculateDuration(item.start_date),
          progress: progress,
          rating: rating,
          status: normalizedStatus,
          tasksCompleted: Math.floor(progress / 5),
          totalTasks: 20,
          attendance: progress > 80 ? 95 : progress > 60 ? 85 : 75,
          feedback: item.feedback,
        };
      });

      setInternData(transformedData);
      message.success('Đã tải dữ liệu thành công!');
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu từ Google Sheets!');
    } finally {
      setLoading(false);
    }
  };
  /* eslint-disable */
  useEffect(() => {
    fetchData();
  }, []);

  // Menu người dùng
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  // Cấu hình cột cho bảng
  const columns: ColumnsType<InternData> = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text: string, record: InternData) => (
        <Space>
          <Avatar src={record.avatar} size={40} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.department}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Người hướng dẫn',
      dataIndex: 'mentor',
      key: 'mentor',
      width: 150,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor="#2c86ff"
          status={progress >= 80 ? 'success' : progress >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: 'Công việc',
      key: 'tasks',
      width: 120,
      render: (_, record: InternData) => (
        <span>
          {record.tasksCompleted}/{record.totalTasks}
        </span>
      ),
    },
    {
      title: 'Chuyên cần',
      dataIndex: 'attendance',
      key: 'attendance',
      width: 100,
      render: (attendance: number) => (
        <span style={{ color: attendance >= 90 ? '#52c41a' : attendance >= 80 ? '#faad14' : '#ff4d4f' }}>
          {attendance}%
        </span>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating: number) => (
        <Rate disabled defaultValue={rating} style={{ fontSize: '14px' }} />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          excellent: { color: 'success', text: 'Xuất sắc' },
          good: { color: 'processing', text: 'Tốt' },
          average: { color: 'warning', text: 'Trung bình' },
          needs_improvement: { color: 'error', text: 'Cần cải thiện' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Nhận xét',
      dataIndex: 'feedback',
      key: 'feedback',
      width: 200,
      ellipsis: true,
    },
  ];

  // Lọc dữ liệu
  const filteredData = internData.filter((item) => {
    const matchDepartment = selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                       item.mentor.toLowerCase().includes(searchText.toLowerCase());
    return matchDepartment && matchSearch;
  });

  // Lấy danh sách phòng ban unique từ dữ liệu
  const departments = Array.from(new Set(internData.map(item => item.department)));

  // Thống kê tổng quan
  const totalInterns = internData.length;
  const excellentInterns = internData.filter(item => item.status === 'excellent').length;
  const avgProgress = internData.length > 0
    ? Math.round(internData.reduce((sum, item) => sum + item.progress, 0) / totalInterns)
    : 0;
  const avgRating = internData.length > 0
    ? (internData.reduce((sum, item) => sum + item.rating, 0) / totalInterns).toFixed(1)
    : '0.0';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* HEADER */}
      <Header
        style={{
          background: '#fff',
          padding: '0 32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo và tên công ty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #2c86ff 0%, #1a5dd6 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(44, 134, 255, 0.3)',
            }}
          >
            C
          </div>
          <div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#2c86ff',
                lineHeight: 1.2,
              }}
            >
              CEH Corporation
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Human Resource Management System
            </div>
          </div>
        </div>

        {/* Menu điều hướng */}
        <Space size="large" style={{ flex: 1, justifyContent: 'center' }}>
          <Button type="text" icon={<HomeOutlined />}>
            Trang chủ
          </Button>
          <Button type="text" icon={<TeamOutlined />} style={{ color: '#2c86ff', fontWeight: 500 }}>
            Nhân viên
          </Button>
          <Button type="text" icon={<BarChartOutlined />}>
            Thống kê
          </Button>
          <Button type="text" icon={<FileTextOutlined />}>
            Báo cáo
          </Button>
        </Space>

        {/* Thông tin người dùng */}
        <Space size="middle">
          <Badge count={5} size="small">
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: '18px' }} />}
              shape="circle"
            />
          </Badge>
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                size={36}
                src="https://i.pravatar.cc/150?img=10"
                style={{ border: '2px solid #2c86ff' }}
              />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>Admin User</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Quản trị viên</div>
              </div>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      {/* SUB HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2c86ff 0%, #1a5dd6 100%)',
          padding: '24px 32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <h1
                style={{
                  color: 'white',
                  margin: 0,
                  fontSize: '28px',
                  fontWeight: 700,
                }}
              >
                Thống kê & Đánh giá Nhân viên Học việc
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '14px' }}>
                Quản lý và theo dõi hiệu suất làm việc của nhân viên học việc
              </p>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={fetchData}
                loading={loading}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 500,
                }}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                style={{
                  background: '#fff',
                  color: '#2c86ff',
                  border: 'none',
                  fontWeight: 500,
                }}
              >
                Xuất báo cáo
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* CONTENT */}
      <Content style={{ padding: '32px', background: '#f5f7fa' }}>
        <Spin spinning={loading} size="large" tip="Đang tải dữ liệu...">
          {/* Thống kê tổng quan */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #2c86ff 0%, #4ba3ff 100%)',
                overflow: 'hidden',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Tổng số học viên</span>}
                value={totalInterns}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                overflow: 'hidden',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Xuất sắc</span>}
                value={excellentInterns}
                prefix={<TrophyOutlined />}
                suffix={`/ ${totalInterns}`}
                valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
                overflow: 'hidden',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Tiến độ trung bình</span>}
                value={avgProgress}
                prefix={<RiseOutlined />}
                suffix="%"
                valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                overflow: 'hidden',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Đánh giá trung bình</span>}
                value={avgRating}
                prefix={<StarOutlined />}
                suffix="/ 5.0"
                valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Bộ lọc */}
        <Card
          bordered={false}
          style={{
            marginBottom: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm theo tên, người hướng dẫn..."
                prefix={<SearchOutlined style={{ color: '#2c86ff' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn phòng ban"
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                size="large"
              >
                <Option value="all">Tất cả phòng ban</Option>
                {departments.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                size="large"
              />
            </Col>
          </Row>
        </Card>

        {/* Bảng danh sách */}
        <Card
          bordered={false}
          style={{
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
          title={
            <Space>
              <Badge count={filteredData.length} showZero color="#2c86ff" />
              <span style={{ fontSize: '16px', fontWeight: 600 }}>Danh sách nhân viên học việc</span>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredData}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} học viên`,
            }}
          />
        </Card>

        {/* Ghi chú */}
        <Card
          bordered={false}
          style={{
            marginTop: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
          title={<span style={{ fontWeight: 600 }}>Chú giải</span>}
          size="small"
        >
          <Space direction="vertical" size="small">
            <Space>
              <Tag color="success">Xuất sắc</Tag>
              <span>Tiến độ ≥ 80%, Đánh giá ≥ 4.5 sao</span>
            </Space>
            <Space>
              <Tag color="processing">Tốt</Tag>
              <span>Tiến độ 60-79%, Đánh giá 4.0-4.4 sao</span>
            </Space>
            <Space>
              <Tag color="warning">Trung bình</Tag>
              <span>Tiến độ 50-59%, Đánh giá 3.0-3.9 sao</span>
            </Space>
            <Space>
              <Tag color="error">Cần cải thiện</Tag>
              <span>Tiến độ {'<'} 50%, Đánh giá {'<'} 3.0 sao</span>
            </Space>
          </Space>
        </Card>
        </Spin>
      </Content>

      {/* FOOTER */}
      <Footer
        style={{
          background: '#001529',
          color: '#fff',
          padding: '48px 32px 24px',
        }}
      >
        <Row gutter={[32, 32]}>
          {/* Thông tin công ty */}
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="middle">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #2c86ff 0%, #1a5dd6 100%)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  C
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#2c86ff' }}>
                    CEH Corporation
                  </div>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', marginBottom: 0 }}>
                Công ty TNHH Công nghệ CEH - Giải pháp nhân sự toàn diện cho doanh nghiệp hiện đại.
              </p>
              <Space size="middle">
                <Button
                  type="text"
                  shape="circle"
                  icon={<FacebookOutlined />}
                  style={{ color: '#2c86ff', background: 'rgba(44, 134, 255, 0.1)' }}
                />
                <Button
                  type="text"
                  shape="circle"
                  icon={<LinkedinOutlined />}
                  style={{ color: '#2c86ff', background: 'rgba(44, 134, 255, 0.1)' }}
                />
                <Button
                  type="text"
                  shape="circle"
                  icon={<TwitterOutlined />}
                  style={{ color: '#2c86ff', background: 'rgba(44, 134, 255, 0.1)' }}
                />
              </Space>
            </Space>
          </Col>

          {/* Liên kết nhanh */}
          <Col xs={24} sm={12} md={8}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              Liên kết nhanh
            </h3>
            <Space direction="vertical" size="small">
              <a href="#" style={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>
                Giới thiệu công ty
              </a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>
                Dịch vụ
              </a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>
                Tuyển dụng
              </a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>
                Tin tức
              </a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>
                Liên hệ
              </a>
            </Space>
          </Col>

          {/* Thông tin liên hệ */}
          <Col xs={24} sm={24} md={8}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              Thông tin liên hệ
            </h3>
            <Space direction="vertical" size="middle">
              <Space>
                <EnvironmentOutlined style={{ color: '#2c86ff', fontSize: '16px' }} />
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
                  123 Đường ABC, Quận 1, TP.HCM
                </span>
              </Space>
              <Space>
                <PhoneOutlined style={{ color: '#2c86ff', fontSize: '16px' }} />
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
                  (+84) 123 456 789
                </span>
              </Space>
              <Space>
                <MailOutlined style={{ color: '#2c86ff', fontSize: '16px' }} />
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
                  contact@ceh.com.vn
                </span>
              </Space>
            </Space>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '32px 0 24px' }} />

        <Row justify="space-between" align="middle">
          <Col>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
              © 2024 CEH Corporation. All rights reserved.
            </span>
          </Col>
          <Col>
            <Space split={<Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
                Chính sách bảo mật
              </a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
                Điều khoản sử dụng
              </a>
            </Space>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
}