import React, { createContext, useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Pagination, Input, Tag, Typography, Space, Button, Divider, Table, Select, Popconfirm, Modal, Form, Layout, Menu, Avatar } from 'antd';
import { UserOutlined, CalendarOutlined, ArrowLeftOutlined, EyeOutlined, GithubOutlined, LinkedinOutlined, TwitterOutlined, MailOutlined, PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, InfoCircleOutlined, SettingOutlined, TagsOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Search, TextArea } = Input;
const { Option } = Select;
const { Header, Content, Footer } = Layout;

export interface BlogTag {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  avatar: string;
  author: string;
  tags: string[];
  status: 'Draft' | 'Published';
  views: number;
  createdAt: string;
}

interface BlogContextType {
  posts: Post[];
  tags: BlogTag[];
  addPost: (post: Omit<Post, 'id' | 'views' | 'createdAt'>) => void;
  updatePost: (id: string, post: Partial<Post>) => void;
  deletePost: (id: string) => void;
  incrementView: (id: string) => void;
  addTag: (name: string) => void;
  updateTag: (id: string, name: string) => void;
  deleteTag: (id: string) => void;
}

const initialTags: BlogTag[] = [
  { id: '1', name: 'React' },
  { id: '2', name: 'TypeScript' },
  { id: '3', name: 'Ant Design' },
];

const initialPosts: Post[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `${i + 1}`,
  title: `Bài viết mẫu số ${i + 1}`,
  slug: `bai-viet-mau-so-${i + 1}`,
  summary: `Đây là đoạn tóm tắt cho bài viết mẫu số ${i + 1}. Nội dung ngắn gọn, súc tích và hiển thị tốt trên UI.`,
  content: `Tiêu đề bài viết ${i + 1}\n\nĐây là nội dung chi tiết của bài viết. Nội dung này được giữ nguyên định dạng xuống dòng.\n\n- Mục 1\n- Mục 2\n\nChúc bạn đọc vui vẻ!`,
  avatar: `https://picsum.photos/seed/${i + 1}/400/200`,
  author: 'KhaiDinhJeemz',
  tags: [initialTags[i % 3].name],
  status: i % 5 === 0 ? 'Draft' : 'Published',
  views: Math.floor(Math.random() * 1000),
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [tags, setTags] = useState<BlogTag[]>(initialTags);

  const addPost = (postData: Omit<Post, 'id' | 'views' | 'createdAt'>) => {
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      views: 0,
      createdAt: new Date().toISOString(),
    };
    setPosts([newPost, ...posts]);
  };

  const updatePost = (id: string, updatedData: Partial<Post>) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  const incrementView = (id: string) => {
    setPosts(prevPosts => prevPosts.map(p => p.id === id ? { ...p, views: p.views + 1 } : p));
  };

  const addTag = (name: string) => {
    const newTag: BlogTag = { id: Date.now().toString(), name };
    setTags([...tags, newTag]);
  };

  const updateTag = (id: string, name: string) => {
    setTags(tags.map((t) => (t.id === id ? { ...t, name } : t)));
    setPosts(posts.map(p => ({
      ...p,
      tags: p.tags.map(tagName => {
        const oldTag = tags.find(tg => tg.id === id);
        return oldTag && tagName === oldTag.name ? name : tagName;
      })
    })));
  };

  const deleteTag = (id: string) => {
    const tagToDelete = tags.find(t => t.id === id);
    if (tagToDelete) {
      setPosts(posts.map(p => ({
        ...p,
        tags: p.tags.filter(tName => tName !== tagToDelete.name)
      })));
    }
    setTags(tags.filter((t) => t.id !== id));
  };

  return (
    <BlogContext.Provider value={{ posts, tags, addPost, updatePost, deletePost, incrementView, addTag, updateTag, deleteTag }}>
      {children}
    </BlogContext.Provider>
  );
};

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Custom Hook để chuyển trang bằng Query Params an toàn
const useNavigateView = () => {
  const history = useHistory();
  return (view: string, slug?: string) => {
    history.push(`?view=${view}${slug ? `&slug=${slug}` : ''}`);
  };
};

const HomePage: React.FC = () => {
  const context = useContext(BlogContext);
  const nav = useNavigateView();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (!context) return null;

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredPosts = context.posts
    .filter(post => post.status === 'Published')
    .filter(post => post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    .filter(post => selectedTag ? post.tags.includes(selectedTag) : true);

  const pageSize = 9;
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col span={12}>
            <Search
              placeholder="Tìm kiếm bài viết..."
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </Col>
          <Col>
            {selectedTag && (
              <Tag closable onClose={() => setSelectedTag(null)} color="blue">
                Đang lọc: {selectedTag}
              </Tag>
            )}
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {paginatedPosts.map((post) => (
            <Col xs={24} sm={12} md={8} key={post.id}>
              <Card
                hoverable
                cover={<img alt={post.title} src={post.avatar} style={{ height: 200, objectFit: 'cover' }} />}
                onClick={() => nav('post', post.slug)}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Card.Meta
                  title={post.title}
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                        {post.summary}
                      </Paragraph>
                      <Space wrap>
                        {post.tags.map(tag => (
                          <Tag
                            key={tag}
                            color="cyan"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(tag);
                              setCurrentPage(1);
                            }}
                          >
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                      <Space split="|" style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}><UserOutlined /> {post.author}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}><CalendarOutlined /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</Text>
                      </Space>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Row justify="center" style={{ marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredPosts.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </Row>
      </Space>
    </div>
  );
};

const PostDetailPage: React.FC = () => {
  const query = new URLSearchParams(useLocation().search);
  const slug = query.get('slug');
  const nav = useNavigateView();
  const context = useContext(BlogContext);

  if (!context) return null;

  const post = context.posts.find(p => p.slug === slug);

  useEffect(() => {
    if (post) {
      context.incrementView(post.id);
    }
  }, [slug]);

  if (!post) {
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => nav('home')} style={{ marginBottom: 16 }}>Quay lại</Button>
        <div>Bài viết không tồn tại.</div>
      </div>
    );
  }

  const relatedPosts = context.posts
    .filter(p => p.id !== post.id && p.status === 'Published' && p.tags.some(t => post.tags.includes(t)))
    .slice(0, 3);

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => nav('home')} style={{ marginBottom: 24 }}>
        Quay lại danh sách
      </Button>
      
      <Title level={1}>{post.title}</Title>
      
      <Space wrap split={<Divider type="vertical" />} style={{ marginBottom: 24 }}>
        <Text><UserOutlined /> {post.author}</Text>
        <Text><CalendarOutlined /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</Text>
        <Text><EyeOutlined /> {post.views} lượt xem</Text>
      </Space>

      <div style={{ marginBottom: 24 }}>
        {post.tags.map(tag => <Tag color="blue" key={tag}>{tag}</Tag>)}
      </div>

      <img src={post.avatar} alt="cover" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginBottom: 24 }} />

      <Typography>
        <div style={{ fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </div>
      </Typography>

      <Divider />

      <Title level={3}>Bài viết liên quan</Title>
      <Row gutter={[16, 16]}>
        {relatedPosts.length > 0 ? (
          relatedPosts.map(rp => (
            <Col xs={24} md={8} key={rp.id}>
              <Card
                hoverable
                cover={<img alt={rp.title} src={rp.avatar} style={{ height: 150, objectFit: 'cover' }} />}
                onClick={() => nav('post', rp.slug)}
              >
                <Card.Meta title={rp.title} description={<Paragraph ellipsis={{ rows: 2 }}>{rp.summary}</Paragraph>} />
              </Card>
            </Col>
          ))
        ) : (
          <Text type="secondary">Không có bài viết liên quan.</Text>
        )}
      </Row>
    </div>
  );
};

const AboutPage: React.FC = () => {
  return (
    <div style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ maxWidth: 800, width: '100%', textAlign: 'center', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bordered={false}>
        <Avatar
          size={160}
          src="https://i.pinimg.com/736x/6d/ab/4f/6dab4f4d9788d9523a4b45b5d40bb453.jpg  "
          style={{ border: '4px solid #1890ff', marginBottom: 24 }}
        />
        <Title level={2}>BLV JeemZz</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>Bình luận viên Bóng đá & Người truyền cảm hứng</Text>
        
        <Divider />
        
        <Paragraph style={{ fontSize: 16, textAlign: 'justify' }}>
          Xin chào! Tôi là Khải, 25 tuổi đang bị bác đầu trọc săn đuổi, bác ấy cầm cái baton. 
          Blog này được tạo ra để chia sẻ kiến thức, những kinh nghiệm thực tế trong quá trình làm việc và học tập.
          Hy vọng những bài viết tại đây sẽ mang lại giá trị hữu ích cho cộng đồng.
        </Paragraph>

        <div style={{ margin: '24px 0' }}>
          <Title level={4}>Kỹ năng</Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            <Tag color="magenta">ReactJS</Tag>
            <Tag color="volcano">NextJS</Tag>
            <Tag color="orange">TypeScript</Tag>
            <Tag color="gold">JavaScript</Tag>
            <Tag color="blue">Ant Design</Tag>
            <Tag color="geekblue">Tailwind CSS</Tag>
            <Tag color="purple">NodeJS</Tag>
          </div>
        </div>

        <Divider />

        <Space size="large">
          <a href="#" target="_blank"><GithubOutlined style={{ fontSize: 28, color: '#333' }} /></a>
          <a href="#" target="_blank"><LinkedinOutlined style={{ fontSize: 28, color: '#0077b5' }} /></a>
          <a href="#" target="_blank"><TwitterOutlined style={{ fontSize: 28, color: '#1da1f2' }} /></a>
          <a href="mailto:email@example.com"><MailOutlined style={{ fontSize: 28, color: '#d44638' }} /></a>
        </Space>
      </Card>
    </div>
  );
};

const AdminPostPage: React.FC = () => {
  const context = useContext(BlogContext);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  if (!context) return null;

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Post) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    context.deletePost(id);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingId) {
        context.updatePost(editingId, values);
      } else {
        context.addPost({ ...values, author: 'Hoàng Đình Khải' });
      }
      setIsModalVisible(false);
    });
  };

  const filteredData = context.posts.filter(p => {
    const matchTitle = p.title.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    return matchTitle && matchStatus;
  });

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Published' ? 'success' : 'default'}>
          {status === 'Published' ? 'Đã đăng' : 'Nháp'}
        </Tag>
      ),
    },
    {
      title: 'Thẻ',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Post) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Search
              placeholder="Tìm theo tiêu đề..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Lọc trạng thái"
              allowClear
              onChange={(value) => setFilterStatus(value)}
              style={{ width: 150 }}
            >
              <Option value="Published">Đã đăng</Option>
              <Option value="Draft">Nháp</Option>
            </Select>
          </Space>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm bài viết
          </Button>
        </Col>
      </Row>

      <Table columns={columns} dataSource={filteredData} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal
        title={editingId ? "Sửa bài viết" : "Thêm bài viết mới"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Vui lòng nhập slug' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="avatar" label="Ảnh đại diện (URL)" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="tags" label="Thẻ (Tags)" rules={[{ required: true }]}>
                <Select mode="multiple" placeholder="Chọn thẻ">
                  {context.tags.map(tag => (
                    <Option key={tag.id} value={tag.name}>{tag.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select>
                  <Option value="Draft">Nháp</Option>
                  <Option value="Published">Đã đăng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="summary" label="Tóm tắt" rules={[{ required: true }]}>
            <TextArea rows={2} />
          </Form.Item>
          
          <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
            <TextArea rows={10} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const AdminTagPage: React.FC = () => {
  const context = useContext(BlogContext);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!context) return null;

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: BlogTag) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    context.deleteTag(id);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingId) {
        context.updateTag(editingId, values.name);
      } else {
        context.addTag(values.name);
      }
      setIsModalVisible(false);
    });
  };

  const tableData = context.tags.map(tag => {
    const usageCount = context.posts.filter(p => p.tags.includes(tag.name)).length;
    return { ...tag, count: usageCount };
  });

  const columns = [
    {
      title: 'Tên thẻ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số bài viết đang sử dụng',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: BlogTag & { count: number }) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm 
            title="Xóa thẻ này sẽ gỡ nó khỏi các bài viết. Bạn chắc chứ?" 
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm thẻ mới
        </Button>
      </div>

      <Table columns={columns} dataSource={tableData} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal
        title={editingId ? "Sửa tên thẻ" : "Thêm thẻ mới"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="name" 
            label="Tên thẻ" 
            rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}
          >
            <Input placeholder="Ví dụ: React, Node.js..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const TH07: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const currentView = query.get('view') || 'home';
  const nav = useNavigateView();

  return (
    <BlogProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px #f0f1f2', zIndex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: 20, marginRight: 48, color: '#1890ff' }}>Blog Khai JeemZz</div>
          <Menu 
            mode="horizontal" 
            selectedKeys={[currentView]} 
            style={{ flex: 1, borderBottom: 'none' }}
          >
            <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => nav('home')}>
              Trang chủ
            </Menu.Item>
            <Menu.Item key="about" icon={<InfoCircleOutlined />} onClick={() => nav('about')}>
              Giới thiệu
            </Menu.Item>
            <Menu.Item key="admin-posts" icon={<SettingOutlined />} onClick={() => nav('admin-posts')}>
              Quản lý bài viết
            </Menu.Item>
            <Menu.Item key="admin-tags" icon={<TagsOutlined />} onClick={() => nav('admin-tags')}>
              Quản lý thẻ
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '24px 48px', margin: 0, minHeight: 280, background: '#f5f5f5' }}>
          <div style={{ background: '#fff', minHeight: '100%', borderRadius: 8 }}>
            {currentView === 'home' && <HomePage />}
            {currentView === 'post' && <PostDetailPage />}
            {currentView === 'about' && <AboutPage />}
            {currentView === 'admin-posts' && <AdminPostPage />}
            {currentView === 'admin-tags' && <AdminTagPage />}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Hoàng Đình Khải ©{new Date().getFullYear()} Created by Hoàng Đình Khải</Footer>
      </Layout>
    </BlogProvider>
  );
};

export default TH07;