import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Button, 
  Input, 
  Row, 
  Col, 
  Typography, 
  Space,
  Table,
  Empty,
  message,
  Form,
  Modal,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SaveOutlined,
  CloseOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { 
  fetchVendors, 
  addVendor, 
  updateVendor, 
  deleteVendor,
  fetchVendorTransactions,
  addVendorTransaction
} from '../store/slices/vendorsSlice';
import { fetchBookings } from '../store/slices/bookingsSlice'; // Import fetchBookings
import { canEdit, canDelete } from '../utils/authUtils'; // Import auth utilities

const { Title, Text } = Typography;

const VendorManagementPage = () => {
  const dispatch = useDispatch();
  const { vendors, transactions } = useSelector(state => state.vendors);
  const bookings = useSelector(state => state.bookings.bookings); // Get bookings from state
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [form] = Form.useForm();
  const [transactionForm] = Form.useForm();
  
  const [vendorForm, setVendorForm] = useState({
    name: '',
    phone: ''
  });
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchVendors());
    dispatch(fetchBookings()); // Fetch bookings when component mounts
  }, [dispatch]);

  const handleAddVendor = () => {
    setIsAdding(true);
    setEditingVendor(null);
    setVendorForm({
      name: '',
      phone: ''
    });
    form.resetFields();
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor.id);
    setVendorForm({
      name: vendor.name,
      phone: vendor.phone || ''
    });
    form.setFieldsValue(vendor);
    setIsAdding(true); // Open the add/edit form
  };

  const handleSaveVendor = () => {
    form.validateFields().then(values => {
      // Get the current vendor data from the Redux store
      const currentVendor = vendors.find(v => v.id === editingVendor) || selectedVendor;
      
      const vendorData = {
        name: values.name,
        phone: values.phone,
        // Include existing totals to preserve them
        totalCredit: currentVendor?.totalCredit || 0,
        totalPaid: currentVendor?.totalPaid || 0
      };
      
      if (editingVendor) {
        // Update existing vendor
        dispatch(updateVendor({ id: editingVendor, ...vendorData }))
          .then(() => {
            message.success('Vendor updated successfully!');
            resetForm();
            // Refresh vendor list to get updated data
            dispatch(fetchVendors());
          })
          .catch(() => {
            message.error('Failed to update vendor.');
          });
      } else {
        // Add new vendor
        dispatch(addVendor(vendorData))
          .then(() => {
            message.success('Vendor added successfully!');
            resetForm();
            // Refresh vendor list to get updated data
            dispatch(fetchVendors());
          })
          .catch(() => {
            message.error('Failed to add vendor.');
          });
      }
    });
  };

  const handleDeleteVendor = (vendorId) => {
    alert('Delete function called for vendor ID: ' + vendorId); // Test if function is called
    // Show confirmation
    Modal.confirm({
      title: 'Delete Vendor',
      content: 'Are you sure you want to delete this vendor?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        alert('Delete confirmed for vendor ID: ' + vendorId); // Test if confirmation works
        return dispatch(deleteVendor(vendorId))
          .then(() => {
            alert('Vendor deleted successfully'); // Test if delete succeeds
            message.success('Vendor deleted successfully!');
            // Refresh the vendor list after deletion
            dispatch(fetchVendors());
          })
          .catch((error) => {
            alert('Delete vendor error: ' + error.message); // Test if there's an error
            // Show the actual error message from the backend
            if (error.message) {
              message.error(error.message);
            } else {
              message.error('Failed to delete vendor.');
            }
          });
      }
    });
  };

  const resetForm = () => {
    form.resetFields();
    setVendorForm({
      name: '',
      phone: ''
    });
    setIsAdding(false);
    setEditingVendor(null);
  };

  const handleViewLedger = (vendor) => {
    setSelectedVendor(vendor);
    dispatch(fetchVendorTransactions(vendor.id));
  };

  const handleMakePayment = (vendor) => {
    setSelectedVendor(vendor);
    setIsPaymentModalOpen(true);
    setPaymentForm({
      amount: '',
      description: ''
    });
    transactionForm.resetFields();
  };

  const handleSavePayment = () => {
    transactionForm.validateFields().then(values => {
      // Use the current outstanding balance directly from vendor totals
      const currentOutstandingBalance = selectedVendor.totalCredit - selectedVendor.totalPaid;
      const paymentAmount = parseFloat(values.amount);
      
      // Calculate the new balance after this payment
      const newBalanceAfter = currentOutstandingBalance - paymentAmount;
      
      const transactionData = {
        vendorId: selectedVendor.id,
        expenseId: null, // No specific expense for manual payments
        type: 'payment',
        amount: paymentAmount,
        description: values.description,
        date: new Date().toISOString().split('T')[0],
        balanceAfter: newBalanceAfter
      };
      
      dispatch(addVendorTransaction(transactionData))
        .then(() => {
          message.success('Payment recorded successfully!');
          // Refresh vendor data to ensure totals are accurate
          dispatch(fetchVendors())
            .then(() => {
              // Also refresh the selected vendor reference if it's the same vendor
              if (selectedVendor) {
                dispatch(fetchVendorTransactions(selectedVendor.id));
              }
            });
          setIsPaymentModalOpen(false);
          transactionForm.resetFields();
        })
        .catch(() => {
          message.error('Failed to record payment.');
        });
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const vendorColumns = [
    {
      title: 'Vendor Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Total Credit',
      dataIndex: 'totalCredit',
      key: 'totalCredit',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Total Paid',
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Balance',
      key: 'balance',
      render: (_, record) => {
        const balance = record.totalCredit - record.totalPaid;
        return (
          <Text type={balance > 0 ? 'danger' : 'success'}>
            {formatCurrency(balance)}
          </Text>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small"
            onClick={() => handleViewLedger(record)}
          >
            Ledger
          </Button>
          <Button 
            size="small"
            icon={<DollarOutlined />}
            onClick={() => handleMakePayment(record)}
            disabled={record.totalCredit - record.totalPaid <= 0}
          >
            Pay
          </Button>
          {canEdit() && (
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEditVendor(record)}
              size="small"
            />
          )}
          {canDelete() && (
            <Button 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteVendor(record.id)}
              danger
              size="small"
            />
          )}
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          backgroundColor: type === 'credit' ? '#fff3cd' : '#d4edda',
          color: type === 'credit' ? '#856404' : '#155724',
          fontSize: '12px'
        }}>
          {type === 'credit' ? 'Credit' : 'Payment'}
        </span>
      )
    },
    {
      title: 'Booking',
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (bookingId) => {
        if (!bookingId) {
          return (
            <span style={{ 
              padding: '4px 8px', 
              borderRadius: '4px', 
              backgroundColor: '#f5f5f5',
              color: '#9e9e9e',
              fontSize: '12px'
            }}>
              -
            </span>
          );
        }
        
        // Convert bookingId to string if it's not already
        const bookingIdStr = String(bookingId);
        
        // Find the booking details
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) {
          return (
            <span style={{ 
              padding: '4px 8px', 
              borderRadius: '4px', 
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              fontSize: '12px'
            }}>
              #{bookingIdStr.substring(0, 8)}
            </span>
          );
        }
        
        return (
          <div>
            <div style={{ 
              padding: '4px 8px', 
              borderRadius: '4px', 
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              fontSize: '12px',
              marginBottom: '2px'
            }}>
              #{bookingIdStr.substring(0, 8)}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {booking.bookingBy} - {new Date(booking.functionDate).toLocaleDateString()}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Balance After',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      render: (amount) => {
        // Display the actual balance value
        return formatCurrency(amount);
      }
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="m-0">
          Vendor Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddVendor}
        >
          Add Vendor
        </Button>
      </div>

      {/* Add/Edit Vendor Form */}
      {(isAdding || editingVendor) && (
        <Card className="mb-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <Title level={5} className="m-0">
              {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            </Title>
            <Button 
              icon={<CloseOutlined />} 
              onClick={resetForm}
            >
              Cancel
            </Button>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveVendor}
            initialValues={vendorForm}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Vendor Name"
                  rules={[{ required: true, message: 'Please enter vendor name' }]}
                >
                  <Input placeholder="Enter vendor name" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone"
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
            </Row>
            
            <div className="flex justify-end">
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                htmlType="submit"
              >
                {editingVendor ? 'Update Vendor' : 'Save Vendor'}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Vendor List */}
      <Card>
        <Title level={4} className="mb-4">Vendor List</Title>
        {vendors.length > 0 ? (
          <Table 
            dataSource={vendors} 
            columns={vendorColumns} 
            pagination={false}
            rowKey="id"
          />
        ) : (
          <Empty
            description={
              <span>
                No vendors found. Get started by adding a new vendor.
              </span>
            }
          />
        )}
      </Card>

      {/* Vendor Ledger Modal */}
      <Modal
        title={`Ledger for ${selectedVendor?.name}`}
        open={selectedVendor && !isPaymentModalOpen && !isAdding}
        onCancel={() => setSelectedVendor(null)}
        footer={null}
        width={800}
      >
        {selectedVendor && (
          <div>
            {/* Get the latest vendor data from the Redux store */}
            {(() => {
              const latestVendor = vendors.find(v => v.id === selectedVendor.id) || selectedVendor;
              return (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded">
                      <Text className="text-blue-700">Total Credit</Text>
                      <Title level={5} className="m-0 text-blue-900">
                        {formatCurrency(latestVendor.totalCredit)}
                      </Title>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <Text className="text-green-700">Total Paid</Text>
                      <Title level={5} className="m-0 text-green-900">
                        {formatCurrency(latestVendor.totalPaid)}
                      </Title>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <Text className="text-yellow-700">Outstanding Balance</Text>
                      <Title level={5} className="m-0 text-yellow-900">
                        {formatCurrency(latestVendor.totalCredit - latestVendor.totalPaid)}
                      </Title>
                    </div>
                  </div>
                  
                  <Divider>Transaction History</Divider>
                  
                  {transactions[latestVendor.id] && transactions[latestVendor.id].length > 0 ? (
                    <Table 
                      dataSource={transactions[latestVendor.id]} 
                      columns={transactionColumns} 
                      pagination={false}
                      rowKey="id"
                    />
                  ) : (
                    <Empty description="No transactions found for this vendor" />
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        title={`Make Payment to ${selectedVendor?.name}`}
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedVendor && (
          <div>
            {/* Get the latest vendor data from the Redux store */}
            {(() => {
              const latestVendor = vendors.find(v => v.id === selectedVendor.id) || selectedVendor;
              return (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded">
                      <Text className="text-blue-700">Total Credit</Text>
                      <Title level={5} className="m-0 text-blue-900">
                        {formatCurrency(latestVendor.totalCredit)}
                      </Title>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <Text className="text-green-700">Total Paid</Text>
                      <Title level={5} className="m-0 text-green-900">
                        {formatCurrency(latestVendor.totalPaid)}
                      </Title>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded col-span-2">
                      <Text className="text-yellow-700">Outstanding Balance</Text>
                      <Title level={5} className="m-0 text-yellow-900">
                        {formatCurrency(latestVendor.totalCredit - latestVendor.totalPaid)}
                      </Title>
                    </div>
                  </div>
                  
                  <Form
                    form={transactionForm}
                    layout="vertical"
                    onFinish={handleSavePayment}
                  >
                    <Form.Item
                      name="amount"
                      label="Payment Amount"
                      rules={[{ required: true, message: 'Please enter payment amount' }]}
                    >
                      <Input 
                        type="number" 
                        placeholder="Enter payment amount" 
                        addonBefore="₨"
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="description"
                      label="Description"
                    >
                      <Input.TextArea placeholder="Enter payment description" rows={3} />
                    </Form.Item>
                    
                    <div className="flex justify-end space-x-3">
                      <Button 
                        onClick={() => setIsPaymentModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                      >
                        Record Payment
                      </Button>
                    </div>
                  </Form>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorManagementPage;