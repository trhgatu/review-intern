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
  Modal,
  Form,
  Popconfirm,
  Drawer,
  Descriptions,
  Timeline,
  Tabs,
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
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Header, Content, Footer } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const API_URL = "/api/interns";

interface ApiInternData {
  id: number;
  name: string;
  department: string;
  start_date: string;
  avg_score: string;
  status: string;
  feedback: string;
}

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

// Interface cho form đánh giá
interface EvaluationForm {
  skillRating: number;
  attitudeRating: number;
  teamworkRating: number;
  communicationRating: number;
  creativityRating: number;
  overallRating: number;
  feedback: string;
  recommendations: string;
}

export default function InternEvaluationPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [internData, setInternData] = useState<InternData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEvaluationDrawerVisible, setIsEvaluationDrawerVisible] = useState<boolean>(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState<boolean>(false);
  const [editingIntern, setEditingIntern] = useState<InternData | null>(null);
  const [selectedIntern, setSelectedIntern] = useState<InternData | null>(null);
  const [form] = Form.useForm();
  const [evaluationForm] = Form.useForm();

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

  // Hàm tính rating từ status
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: ApiInternData[] = await response.json();

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
          mentor: `Mentor ${index + 1}`,
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

  const handleAddEdit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // ✅ Tạo payload JSON chuẩn
      const payload: Record<string, any> = {
        action: editingIntern ? "update" : "create",
        name: values.name,
        department: values.department,
        start_date: dayjs(values.startDate).toISOString(),
        status: values.status,
        feedback: values.feedback || "",
      };

      // Nếu là update thì thêm id
      if (editingIntern) {
        payload.id = editingIntern.id;
      }

      // ✅ Gửi JSON body qua Next.js proxy
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        message.success(
          editingIntern
            ? "Cập nhật học viên thành công!"
            : "Thêm học viên thành công!"
        );
        await fetchData();
      } else {
        message.error("Thao tác thất bại: " + result.message);
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingIntern(null);
    } catch (error) {
      console.error("Error in handleAddEdit:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          id: id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success("Xóa học viên thành công!");
        await fetchData();
      } else {
        message.error("Xóa thất bại: " + result.message);
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };


  const showModal = (intern?: InternData) => {
    if (intern) {
      setEditingIntern(intern);
      form.setFieldsValue({
        name: intern.name,
        department: intern.department,
        startDate: dayjs(intern.startDate, 'DD/MM/YYYY'),
        feedback: intern.feedback,
        status: intern.status === 'excellent' ? 'Excellent' :
          intern.status === 'good' ? 'Good' :
            intern.status === 'average' ? 'Average' : 'Needs Improvement',
      });
    } else {
      setEditingIntern(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Mở drawer đánh giá
  const showEvaluationDrawer = (intern: InternData) => {
    setSelectedIntern(intern);
    evaluationForm.resetFields();
    setIsEvaluationDrawerVisible(true);
  };

  // Mở drawer chi tiết
  const showDetailDrawer = (intern: InternData) => {
    setSelectedIntern(intern);
    setIsDetailDrawerVisible(true);
  };

  const handleEvaluation = async () => {
    try {
      const values: EvaluationForm = await evaluationForm.validateFields();
      setLoading(true);

      const avgRating =
        (values.skillRating +
          values.attitudeRating +
          values.teamworkRating +
          values.communicationRating +
          values.creativityRating) /
        5;

      const formData = new URLSearchParams();
      formData.append("action", "update");
      formData.append("id", selectedIntern?.id ? String(selectedIntern.id) : "");
      formData.append("feedback", values.feedback);
      formData.append("avg_score", avgRating.toFixed(1));
      formData.append(
        "status",
        avgRating >= 4.5
          ? "Excellent"
          : avgRating >= 4.0
            ? "Good"
            : avgRating >= 3.0
              ? "Average"
              : "Needs Improvement"
      );

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        message.success("Đánh giá thành công!");
        await fetchData();
        setIsEvaluationDrawerVisible(false);
        evaluationForm.resetFields();
      } else {
        message.error("Lưu đánh giá thất bại: " + result.message);
      }
    } catch (error) {
      console.error("Error in handleEvaluation:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };


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
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record: InternData) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetailDrawer(record)}
            size="small"
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<StarOutlined />}
            onClick={() => showEvaluationDrawer(record)}
            size="small"
            style={{ color: '#faad14' }}
          >
            Đánh giá
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa học viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = internData.filter((item) => {
    const matchDepartment = selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.mentor.toLowerCase().includes(searchText.toLowerCase());
    return matchDepartment && matchSearch;
  });

  const departments = Array.from(new Set(internData.map(item => item.department)));

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <img
              src="/logo.jpg"
              alt="CEH Logo"
              style={{
                width: 120,
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

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
                icon={<PlusOutlined />}
                size="large"
                onClick={() => showModal()}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 500,
                }}
              >
                Thêm học viên
              </Button>
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
      <Content style={{ padding: '32px', background: '#f5f7fa' }}>
        <Spin spinning={loading} size="large" tip="Đang tải dữ liệu...">
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
              scroll={{ x: 1400 }}
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
                    CEH
                  </div>
                </div>
              </div>
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

      {/* Modal Thêm/Sửa học viên */}
      <Modal
        title={editingIntern ? 'Chỉnh sửa học viên' : 'Thêm học viên mới'}
        open={isModalVisible}
        onOk={handleAddEdit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingIntern(null);
        }}
        okText={editingIntern ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nhập họ và tên" size="large" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Phòng ban"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
          >
            <Select placeholder="Chọn phòng ban" size="large">
              <Option value="IT">IT</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Design">Design</Option>
              <Option value="HR">HR</Option>
              <Option value="Sales">Sales</Option>
              <Option value="Triển khai">Sales</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái" size="large">
              <Option value="Excellent">Xuất sắc</Option>
              <Option value="Good">Tốt</Option>
              <Option value="Average">Trung bình</Option>
              <Option value="Needs Improvement">Cần cải thiện</Option>
            </Select>
          </Form.Item>

          <Form.Item name="feedback" label="Nhận xét">
            <TextArea rows={4} placeholder="Nhập nhận xét về học viên" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer Đánh giá chi tiết */}


      <Drawer
        title={
          <Space>
            <StarOutlined style={{ color: '#faad14' }} />
            <span>Đánh giá học viên</span>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => setIsEvaluationDrawerVisible(false)}
        open={isEvaluationDrawerVisible}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setIsEvaluationDrawerVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleEvaluation} icon={<CheckCircleOutlined />}>
              Lưu đánh giá
            </Button>
          </Space>
        }
      >
        {selectedIntern && (
          <>
            <Card
              style={{ marginBottom: '24px', background: '#f5f7fa' }}
              bordered={false}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  <Avatar src={selectedIntern.avatar} size={64} />
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedIntern.name}</h3>
                    <p style={{ margin: 0, color: '#666' }}>{selectedIntern.department}</p>
                  </div>
                </Space>
              </Space>
            </Card>

            <Form form={evaluationForm} layout="vertical">
              <h4 style={{ marginTop: '16px', marginBottom: '16px' }}>Đánh giá các tiêu chí</h4>

              <Form.Item
                name="skillRating"
                label="Kỹ năng chuyên môn"
                rules={[{ required: true, message: 'Vui lòng đánh giá!' }]}
              >
                <Rate allowHalf style={{ fontSize: '24px' }} />
              </Form.Item>

              <Form.Item
                name="attitudeRating"
                label="Thái độ làm việc"
                rules={[{ required: true, message: 'Vui lòng đánh giá!' }]}
              >
                <Rate allowHalf style={{ fontSize: '24px' }} />
              </Form.Item>

              <Form.Item
                name="teamworkRating"
                label="Làm việc nhóm"
                rules={[{ required: true, message: 'Vui lòng đánh giá!' }]}
              >
                <Rate allowHalf style={{ fontSize: '24px' }} />
              </Form.Item>

              <Form.Item
                name="communicationRating"
                label="Kỹ năng giao tiếp"
                rules={[{ required: true, message: 'Vui lòng đánh giá!' }]}
              >
                <Rate allowHalf style={{ fontSize: '24px' }} />
              </Form.Item>

              <Form.Item
                name="creativityRating"
                label="Tư duy sáng tạo"
                rules={[{ required: true, message: 'Vui lòng đánh giá!' }]}
              >
                <Rate allowHalf style={{ fontSize: '24px' }} />
              </Form.Item>

              <Divider />

              <Form.Item
                name="feedback"
                label="Nhận xét chi tiết"
                rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập nhận xét chi tiết về học viên..."
                />
              </Form.Item>

              <Form.Item
                name="recommendations"
                label="Đề xuất phát triển"
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập đề xuất để học viên phát triển tốt hơn..."
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>

      {/* Drawer Xem chi tiết */}
      <Drawer
        title={
          <Space>
            <EyeOutlined style={{ color: '#2c86ff' }} />
            <span>Thông tin chi tiết</span>
          </Space>
        }
        placement="right"
        width={700}
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
      >
        {selectedIntern && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin cơ bản" key="1">
              <Card
                style={{ marginBottom: '24px' }}
                bordered={false}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space>
                    <Avatar src={selectedIntern.avatar} size={80} />
                    <div>
                      <h2 style={{ margin: 0 }}>{selectedIntern.name}</h2>
                      <Tag color={
                        selectedIntern.status === 'excellent' ? 'success' :
                          selectedIntern.status === 'good' ? 'processing' :
                            selectedIntern.status === 'average' ? 'warning' : 'error'
                      }>
                        {selectedIntern.status === 'excellent' ? 'Xuất sắc' :
                          selectedIntern.status === 'good' ? 'Tốt' :
                            selectedIntern.status === 'average' ? 'Trung bình' : 'Cần cải thiện'}
                      </Tag>
                    </div>
                  </Space>
                </Space>
              </Card>

              <Descriptions bordered column={1}>
                <Descriptions.Item label="Phòng ban">
                  {selectedIntern.department}
                </Descriptions.Item>
                <Descriptions.Item label="Người hướng dẫn">
                  {selectedIntern.mentor}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu">
                  {selectedIntern.startDate}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian làm việc">
                  {selectedIntern.duration}
                </Descriptions.Item>
                <Descriptions.Item label="Tiến độ">
                  <Progress percent={selectedIntern.progress} strokeColor="#2c86ff" />
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá">
                  <Rate disabled value={selectedIntern.rating} />
                </Descriptions.Item>
                <Descriptions.Item label="Công việc hoàn thành">
                  {selectedIntern.tasksCompleted}/{selectedIntern.totalTasks} tasks
                </Descriptions.Item>
                <Descriptions.Item label="Chuyên cần">
                  <span style={{
                    color: selectedIntern.attendance >= 90 ? '#52c41a' :
                      selectedIntern.attendance >= 80 ? '#faad14' : '#ff4d4f',
                    fontWeight: 600
                  }}>
                    {selectedIntern.attendance}%
                  </span>
                </Descriptions.Item>
              </Descriptions>

              <Card
                title="Nhận xét"
                style={{ marginTop: '24px' }}
                bordered={false}
              >
                <p>{selectedIntern.feedback}</p>
              </Card>
            </TabPane>

            <TabPane tab="Lịch sử đánh giá" key="2">
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <>
                        <p style={{ fontWeight: 600 }}>Đánh giá tháng 11/2024</p>
                        <p>Kỹ năng: <Rate disabled defaultValue={4.5} style={{ fontSize: '14px' }} /></p>
                        <p style={{ color: '#666' }}>Tiến bộ rõ rệt về kỹ năng coding</p>
                      </>
                    ),
                  },
                  {
                    color: 'blue',
                    children: (
                      <>
                        <p style={{ fontWeight: 600 }}>Đánh giá tháng 10/2024</p>
                        <p>Kỹ năng: <Rate disabled defaultValue={4.0} style={{ fontSize: '14px' }} /></p>
                        <p style={{ color: '#666' }}>Làm việc chăm chỉ, cần cải thiện teamwork</p>
                      </>
                    ),
                  },
                  {
                    color: 'gray',
                    children: (
                      <>
                        <p style={{ fontWeight: 600 }}>Đánh giá tháng 9/2024</p>
                        <p>Kỹ năng: <Rate disabled defaultValue={3.5} style={{ fontSize: '14px' }} /></p>
                        <p style={{ color: '#666' }}>Bắt đầu làm quen với công việc</p>
                      </>
                    ),
                  },
                ]}
              />
            </TabPane>

            <TabPane tab="Thống kê" key="3">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Số ngày làm việc"
                      value={90}
                      suffix="ngày"
                      valueStyle={{ color: '#2c86ff' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Tasks hoàn thành"
                      value={selectedIntern.tasksCompleted}
                      suffix={`/ ${selectedIntern.totalTasks}`}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Chuyên cần"
                      value={selectedIntern.attendance}
                      suffix="%"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Đánh giá trung bình"
                      value={selectedIntern.rating}
                      suffix="/ 5.0"
                      valueStyle={{ color: '#eb2f96' }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </Layout>
  );
}