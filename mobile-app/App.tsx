import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, FlatList, StatusBar, Platform } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { authService } from './src/services/api/authService';
import { menuService } from './src/services/api/menuService';
import { orderService } from './src/services/api/orderService';
import { userService } from './src/services/api/userService';
import { adminService } from './src/services/api/adminService';
import { User, MenuItem, Address, Order } from './src/types';

const THEME = {
  primary: '#E65100', // Deep Gourmet Orange
  secondary: '#1A237E', // Royal Blue
  accent: '#FFD600', // Golden Highlight
  background: '#F8F9FA', // Light Gray/White
  cardBg: '#FFFFFF',
  textMain: '#212121',
  textSecondary: '#757575',
  error: '#B00020',
  success: '#388E3C',
  radius: 16,
  shadow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    android: { elevation: 4 },
    default: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
  }),
  fontBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed', // Using system fonts but better variations
};

// Shared Helper: Get food emoji based on category
const getCategoryEmoji = (category: string) => {
  const emojiMap: { [key: string]: string } = {
    'Indian': '🍛',
    'Chinese': '🍜',
    'Italian': '🍕',
    'Bakery': '🧁',
    'Beverages': '☕',
    'Desserts': '🍰',
    'Starters': '🥗',
  };
  return emojiMap[category] || '🍽️';
};

type Screen = 'login' | 'home' | 'menu' | 'cart' | 'checkout' | 'confirmation' | 'orders' | 'orderDetail' | 'profile' | 'editProfile' | 'addresses' | 'addAddress' | 'editAddress' | 'adminDashboard' | 'adminOrders' | 'adminInventory';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    if (userData.role?.toUpperCase() === 'ADMIN') {
      setCurrentScreen('adminDashboard');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentScreen('login');
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = await userService.updateProfile(user.id, data);
      setUser(updatedUser);
      Alert.alert('Success', 'Profile updated');
      setCurrentScreen('profile');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddressAction = async (action: 'add' | 'update' | 'delete', data?: any) => {
    if (!user) return;
    try {
      if (action === 'delete') {
        await userService.deleteAddress(data);
        Alert.alert('Success', 'Address deleted');
      } else if (action === 'add') {
        await userService.addAddress({ ...data, userId: user.id });
        Alert.alert('Success', 'Address added');
        setCurrentScreen('addresses');
      } else if (action === 'update') {
        await userService.updateAddress({ ...data, id: editingAddress?.id });
        Alert.alert('Success', 'Address updated');
        setCurrentScreen('addresses');
        setEditingAddress(null);
      }

      const updatedAddresses = await userService.getAddresses(user.id);
      setAddresses(updatedAddresses);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setCurrentScreen('editAddress');
  };

  const openAddressList = async () => {
    if (!user) return;
    try {
      const userAddresses = await userService.getAddresses(user.id);
      setAddresses(userAddresses);
      setCurrentScreen('addresses');
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    Alert.alert('Added!', `${item.name} added to cart`);
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(c => c.item.id !== itemId));
    } else {
      setCart(prev =>
        prev.map(c => (c.item.id === itemId ? { ...c, quantity: newQuantity } : c))
      );
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }
    // Load addresses before checkout
    if (user) {
      userService.getAddresses(user.id).then(setAddresses).catch(() => { });
    }
    setCurrentScreen('checkout');
  };

  const handleOrderPlaced = (orderId: number) => {
    setLastOrderId(orderId);
    setCart([]);
    setCurrentScreen('confirmation');
  };

  const handleViewOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setCurrentScreen('orderDetail');
  };

  const handleReorder = (order: any) => {
    try {
      const items = JSON.parse(order.items || '[]');
      // Clear existing cart first for cleaner UX
      setCart([]);

      // Add items from order to cart
      const cartItems = items.map((orderItem: any) => {
        const menuItem: MenuItem = {
          id: orderItem.menuItemId,
          name: orderItem.name,
          price: orderItem.price,
          description: '',
          category: '',
          stockQuantity: 100,
          lowStockThreshold: 10,
          unit: 'piece',
          isAvailable: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { item: menuItem, quantity: orderItem.quantity };
      });

      setCart(cartItems);
      Alert.alert('Success!', `Order #${order.id} items added to cart`);
      setCurrentScreen('cart');
    } catch (error) {
      Alert.alert('Error', 'Failed to reorder');
    }
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {currentScreen === 'home' && <HomeScreen user={user} />}
        {currentScreen === 'menu' && <MenuScreen onAddToCart={addToCart} />}
        {currentScreen === 'cart' && (
          <CartScreen cart={cart} onUpdateQuantity={updateQuantity} total={cartTotal} onCheckout={handleCheckout} getCategoryEmoji={getCategoryEmoji} />
        )}
        {currentScreen === 'checkout' && user && (
          <CheckoutScreen
            cart={cart}
            total={cartTotal}
            user={user}
            addresses={addresses}
            onOrderPlaced={handleOrderPlaced}
            onBack={() => setCurrentScreen('cart')}
            onManageAddresses={openAddressList}
          />
        )}
        {currentScreen === 'confirmation' && (
          <OrderConfirmationScreen orderId={lastOrderId} onBackToHome={() => setCurrentScreen('home')} onViewOrders={() => setCurrentScreen('orders')} />
        )}
        {currentScreen === 'orders' && user && (
          <OrdersScreen userId={user.id} onViewDetail={handleViewOrderDetail} />
        )}
        {currentScreen === 'orderDetail' && selectedOrder && (
          <OrderDetailScreen order={selectedOrder} onBack={() => setCurrentScreen('orders')} onReorder={() => handleReorder(selectedOrder)} />
        )}
        {currentScreen === 'profile' && (
          <ProfileScreen
            user={user}
            onLogout={handleLogout}
            onEditProfile={() => setCurrentScreen('editProfile')}
            onManageAddresses={openAddressList}
          />
        )}
        {currentScreen === 'editProfile' && user && (
          <EditProfileScreen
            user={user}
            onSave={handleUpdateProfile}
            onBack={() => setCurrentScreen('profile')}
          />
        )}
        {currentScreen === 'addresses' && (
          <AddressListScreen
            addresses={addresses}
            onAdd={() => { setEditingAddress(null); setCurrentScreen('addAddress'); }}
            onEdit={handleEditAddress}
            onDelete={(id) => handleAddressAction('delete', id)}
            onBack={() => setCurrentScreen('profile')}
          />
        )}
        {(currentScreen === 'addAddress' || currentScreen === 'editAddress') && (
          <AddEditAddressScreen
            address={editingAddress}
            onSave={(data) => handleAddressAction(editingAddress ? 'update' : 'add', data)}
            onBack={() => { setEditingAddress(null); setCurrentScreen('addresses'); }}
          />
        )}
        {currentScreen === 'adminDashboard' && user?.role?.toUpperCase() === 'ADMIN' && <AdminDashboardScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'adminOrders' && user?.role?.toUpperCase() === 'ADMIN' && <AdminOrdersScreen onBack={() => setCurrentScreen('adminDashboard')} />}
        {currentScreen === 'adminInventory' && user?.role?.toUpperCase() === 'ADMIN' && <AdminInventoryScreen onBack={() => setCurrentScreen('adminDashboard')} />}
      </View>

      {/* Custom Bottom Navigation - Role Based */}
      {['checkout', 'confirmation', 'orderDetail', 'editProfile', 'addresses', 'addAddress', 'editAddress'].indexOf(currentScreen) === -1 && (
        <View style={styles.navbar}>
          {user.role?.toUpperCase() === 'ADMIN' ? (
            <>
              <NavButton icon="view-dashboard" label="Dashboard" active={currentScreen === 'adminDashboard'} onPress={() => setCurrentScreen('adminDashboard')} />
              <NavButton icon="package-variant-closed" label="Orders" active={currentScreen === 'adminOrders'} onPress={() => setCurrentScreen('adminOrders')} />
              <NavButton icon="fountain-pen-tip" label="Inventory" active={currentScreen === 'adminInventory'} onPress={() => setCurrentScreen('adminInventory')} />
              <NavButton icon="account-circle" label="Profile" active={currentScreen === 'profile'} onPress={() => setCurrentScreen('profile')} />
            </>
          ) : (
            <>
              <NavButton icon="home-variant" label="Home" active={currentScreen === 'home'} onPress={() => setCurrentScreen('home')} />
              <NavButton icon="silverware-fork-knife" label="Menu" active={currentScreen === 'menu'} onPress={() => setCurrentScreen('menu')} />
              <NavButton icon="cart" label="Cart" badge={cartCount} active={currentScreen === 'cart'} onPress={() => setCurrentScreen('cart')} />
              <NavButton icon="clipboard-list" label="Orders" active={currentScreen === 'orders'} onPress={() => setCurrentScreen('orders')} />
              <NavButton icon="account" label="Profile" active={currentScreen === 'profile'} onPress={() => setCurrentScreen('profile')} />
            </>
          )}
        </View>
      )}
    </View>
  );
}

// Navigation Button Component
function NavButton({ icon, label, active, badge, onPress }: { icon: string; label: string; active: boolean; badge?: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.navButton} onPress={onPress} activeOpacity={0.7}>
      <View>
        <Icon name={icon as any} size={26} color={active ? THEME.primary : THEME.textSecondary} />
        {badge && badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Login Screen
function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login({ email, password });
      onLoginSuccess(user);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <StatusBar barStyle="light-content" />
      <Icon name="flower-tulip" size={100} color={THEME.accent} style={{ marginBottom: 20 }} />
      <Text style={styles.appTitle}>Gourmet Garden ✨</Text>
      <Text style={styles.subtitle}>Premium • Organic • Exceptional</Text>

      <View style={{ width: '100%', marginTop: 20 }}>
        <View style={{ position: 'relative' }}>
          <Icon name="email-outline" size={20} color={THEME.primary} style={{ position: 'absolute', left: 15, top: 18, zIndex: 1 }} />
          <TextInput
            style={[styles.input, { paddingLeft: 45 }]}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={{ position: 'relative' }}>
          <Icon name="lock-outline" size={20} color={THEME.primary} style={{ position: 'absolute', left: 15, top: 18, zIndex: 1 }} />
          <TextInput
            style={[styles.input, { paddingLeft: 45 }]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Admin: jane.smith@example.com (pass: password123)</Text>
      <Text style={styles.hint}>User: john.doe@example.com (pass: password123)</Text>
    </View>
  );
}

// Home Screen
function HomeScreen({ user }: { user: User }) {
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.userName}>{user.name}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎉 App Running Successfully!</Text>
        <Text style={styles.cardText}>Your mobile app is now working on your phone! Use the navigation buttons below to explore.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <Text style={styles.cardText}>• Browse Menu - See our delicious items</Text>
        <Text style={styles.cardText}>• Add to Cart - Build your order</Text>
        <Text style={styles.cardText}>• Checkout - Complete your purchase</Text>
      </View>
    </ScrollView>
  );
}

// Menu Screen - ENHANCED with Search & Filters
function MenuScreen({ onAddToCart }: { onAddToCart: (item: MenuItem) => void }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');

  React.useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await menuService.getAllItems();
      setItems(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading delicious items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuTitle}>Menu</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color={THEME.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color={THEME.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive
              ]}>
                {category === 'All' ? '🍽️ All' : `${getCategoryEmoji(category)} ${category}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort:</Text>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price-low' && styles.sortButtonActive]}
            onPress={() => setSortBy('price-low')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'price-low' && styles.sortButtonTextActive]}>₹ Low</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price-high' && styles.sortButtonActive]}
            onPress={() => setSortBy('price-high')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'price-high' && styles.sortButtonTextActive]}>₹ High</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items List */}
      {filteredItems.length === 0 ? (
        <View style={styles.centerScreen}>
          <Icon name="food-off" size={80} color="#ddd" style={{ marginBottom: 20 }} />
          <Text style={styles.emptyText}>No items found</Text>
          <Text style={styles.hintText}>Try a different search or category</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.menuGrid}
          renderItem={({ item }) => (
            <View style={styles.menuCard}>
              <View style={styles.menuCardImage}>
                <Text style={styles.foodEmoji}>{getCategoryEmoji(item.category)}</Text>
              </View>
              <View style={styles.menuCardContent}>
                <View style={styles.menuCardHeader}>
                  <Text style={styles.menuCardName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.menuCardDesc} numberOfLines={2}>{item.description || 'Delicious item'}</Text>
                <View style={styles.menuCardFooter}>
                  <Text style={styles.menuCardPrice}>₹{item.price}</Text>
                  <TouchableOpacity
                    style={styles.addButtonNew}
                    onPress={() => onAddToCart(item)}
                  >
                    <Text style={styles.addButtonTextNew}>ADD +</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

// Cart Screen
function CartScreen({ cart, onUpdateQuantity, total, onCheckout, getCategoryEmoji }: { cart: { item: MenuItem; quantity: number }[]; onUpdateQuantity: (itemId: number, quantity: number) => void; total: number; onCheckout: () => void; getCategoryEmoji: (category: string) => string }) {
  if (cart.length === 0) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Cart</Text>
      </View>
      <FlatList
        data={cart}
        keyExtractor={item => item.item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={{ backgroundColor: '#fff5f0', padding: 10, borderRadius: 12, marginRight: 15 }}>
              <Text style={{ fontSize: 24 }}>{getCategoryEmoji(item.item.category)}</Text>
            </View>
            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName}>{item.item.name}</Text>
              <Text style={styles.cartItemPrice}>₹{item.item.price}</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity onPress={() => onUpdateQuantity(item.item.id, item.quantity - 1)} style={styles.quantityButton}>
                <Icon name="minus" size={20} color={THEME.textMain} />
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => onUpdateQuantity(item.item.id, item.quantity + 1)} style={styles.quantityButton}>
                <Icon name="plus" size={20} color={THEME.textMain} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.cartFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹{total}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
              <Text style={styles.buttonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// NEW: Checkout Screen
function CheckoutScreen({ cart, total, user, addresses, onOrderPlaced, onBack, onManageAddresses }: { cart: { item: MenuItem; quantity: number }[]; total: number; user: User; addresses: Address[]; onOrderPlaced: (orderId: number) => void; onBack: () => void; onManageAddresses: () => void }) {
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const [deliveryAddress, setDeliveryAddress] = useState(defaultAddress ? `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.zip}` : '');
  const [phoneNumber, setPhoneNumber] = useState(user.phone || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (defaultAddress && !deliveryAddress) {
      setDeliveryAddress(`${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.zip}`);
    }
  }, [defaultAddress]);

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map(c => ({
        id: c.item.id,
        name: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
      }));

      const order = await orderService.createOrder({
        userId: user.id,
        items: orderItems,
        total: total,
        addressId: defaultAddress?.id // In real app, we'd pass the actual selected address ID
      });

      onOrderPlaced(order.id);
    } catch (error: any) {
      Alert.alert('Order Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Checkout</Text>
      </View>

      <View style={styles.checkoutCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <TouchableOpacity onPress={onManageAddresses}>
            <Text style={{ color: '#FF6B35', fontWeight: 'bold' }}>Manage Addresses</Text>
          </TouchableOpacity>
        </View>

        {addresses.length > 0 ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Select Address:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {addresses.map(addr => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressOption,
                    deliveryAddress.includes(addr.street) && styles.addressOptionSelected
                  ]}
                  onPress={() => setDeliveryAddress(`${addr.street}, ${addr.city}, ${addr.zip}`)}
                >
                  <Text style={[
                    styles.addressOptionText,
                    deliveryAddress.includes(addr.street) && styles.addressOptionTextSelected
                  ]}>
                    {addr.isDefault ? '🏠 ' : '📍 '}
                    {addr.street}, {addr.city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter delivery address"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
          numberOfLines={3}
        />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.checkoutCard}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cart.map(c => (
          <View key={c.item.id} style={styles.summaryRow}>
            <Text style={styles.summaryItem}>{c.item.name} x {c.quantity}</Text>
            <Text style={styles.summaryPrice}>₹{c.item.price * c.quantity}</Text>
          </View>
        ))}
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
        </View>
      </View>

      <View style={styles.checkoutCard}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4ff', padding: 15, borderRadius: 12 }}>
          <Icon name="cash-marker" size={24} color={THEME.secondary} style={{ marginRight: 12 }} />
          <Text style={[styles.paymentMethod, { marginBottom: 0 }]}>Cash on Delivery</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Place Order</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// NEW: Order Confirmation Screen
function OrderConfirmationScreen({ orderId, onBackToHome, onViewOrders }: { orderId: number | null; onBackToHome: () => void; onViewOrders: () => void }) {
  return (
    <View style={styles.confirmationContainer}>
      <Icon name="check-decagram" size={100} color={THEME.success} style={{ marginBottom: 20 }} />
      <Text style={styles.successTitle}>Order Placed!</Text>
      <Text style={styles.successText}>Your gourmet meal is on its way</Text>
      {orderId && (
        <View style={{ backgroundColor: '#f0f4ff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 30 }}>
          <Text style={styles.orderIdText}>Order ID: #{orderId}</Text>
        </View>
      )}

      <View style={styles.confirmationCard}>
        <Text style={styles.cardTitle}>Next Steps</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Icon name="chef-hat" size={20} color={THEME.primary} style={{ marginRight: 10 }} />
          <Text style={styles.cardText}>Expert chefs are preparing your food</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Icon name="phone-check" size={20} color={THEME.primary} style={{ marginRight: 10 }} />
          <Text style={styles.cardText}>We'll notify you once it's dispatched</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="map-marker-distance" size={20} color={THEME.primary} style={{ marginRight: 10 }} />
          <Text style={styles.cardText}>Track live updates in your orders</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onViewOrders}>
        <Text style={styles.buttonText}>View My Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onBackToHome}>
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

// UPDATED: Orders Screen with history
function OrdersScreen({ userId, onViewDetail }: { userId: number; onViewDetail: (order: any) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrderHistory(userId);
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centerScreen}>
        <Icon name="clipboard-text-outline" size={80} color="#ddd" style={{ marginBottom: 20 }} />
        <Text style={styles.emptyText}>No orders yet</Text>
        <Text style={styles.hintText}>Your culinary journey starts here!</Text>
        <TouchableOpacity style={[styles.primaryButton, { marginTop: 20 }]} onPress={() => { /* Navigate to menu */ }}>
          <Text style={styles.buttonText}>Order Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>My Orders</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const itemsArray = JSON.parse(item.items || '[]');
          return (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => onViewDetail(item)}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderIdText}>Order #{item.id}</Text>
                <View style={[styles.statusBadge, item.status === 'pending' ? styles.statusPending : styles.statusConfirmed]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.orderItems}>{itemsArray.length} items • ₹{item.total}</Text>
              <Text style={styles.viewDetailsText}>Tap to view details →</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// NEW: Order Detail Screen with Status Timeline
function OrderDetailScreen({ order, onBack, onReorder }: { order: any; onBack: () => void; onReorder: () => void }) {
  const orderItems = JSON.parse(order.items || '[]');

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { id: 'pending', label: 'Order Placed', icon: 'cart-check', completed: true },
      { id: 'confirmed', label: 'Confirmed', icon: 'check-circle-outline', completed: currentStatus !== 'pending' },
      { id: 'preparing', label: 'Preparing', icon: 'chef-hat', completed: currentStatus === 'delivered' || currentStatus === 'out_for_delivery' },
      { id: 'out_for_delivery', label: 'Out for Delivery', icon: 'moped', completed: currentStatus === 'delivered' },
      { id: 'delivered', label: 'Delivered', icon: 'star-face', completed: currentStatus === 'delivered' },
    ];
    return steps;
  };

  const statusSteps = getStatusSteps(order.status);

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Order Details</Text>
      </View>

      {/* Order Info Card */}
      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order ID</Text>
          <Text style={styles.detailValue}>#{order.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={[styles.statusBadge, order.status === 'pending' ? styles.statusPending : styles.statusConfirmed]}>
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Status Timeline */}
      <Text style={styles.sectionTitleOutside}>Order Status</Text>
      <View style={styles.detailCard}>
        {statusSteps.map((step, index) => (
          <View key={step.id} style={styles.timelineStep}>
            <View style={styles.timelineIconContainer}>
              <View style={[styles.timelineIcon, step.completed && styles.timelineIconCompleted]}>
                <Icon name={step.icon as any} size={22} color={step.completed ? '#fff' : '#ccc'} />
              </View>
              {index < statusSteps.length - 1 && (
                <View style={[styles.timelineLine, step.completed && styles.timelineLineCompleted]} />
              )}
            </View>
            <View style={styles.timelineLabelContainer}>
              <Text style={[styles.timelineLabel, step.completed && styles.timelineLabelCompleted]}>
                {step.label}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Order Items */}
      <Text style={styles.sectionTitleOutside}>Order Items</Text>
      <View style={styles.detailCard}>
        {orderItems.map((item: any, index: number) => (
          <View key={index} style={styles.detailItemRow}>
            <View style={styles.detailItemInfo}>
              <Text style={styles.detailItemName}>{item.name}</Text>
              <Text style={styles.detailItemQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.detailItemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={[styles.detailRow, styles.totalDivider]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{order.total}</Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.reorderButton} onPress={onReorder}>
        <Text style={styles.buttonText}>🔄 Reorder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Profile Screen
function ProfileScreen({ user, onLogout, onEditProfile, onManageAddresses }: { user: User; onLogout: () => void; onEditProfile: () => void; onManageAddresses: () => void }) {
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.profileHeader}>
        <View style={{ position: 'relative' }}>
          <Icon name="account-circle" size={110} color={THEME.primary} style={styles.profileIcon} />
          <View style={{ position: 'absolute', bottom: 15, right: 0, backgroundColor: THEME.success, width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: '#fff' }} />
        </View>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
        <TouchableOpacity style={styles.editProfileButton} onPress={onEditProfile}>
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.menuRow} onPress={onManageAddresses}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="map-marker-radius" size={24} color={THEME.secondary} style={{ marginRight: 15 }} />
            <Text style={styles.menuRowText}>Manage Addresses</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('History', 'Order history coming soon!')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="history" size={24} color={THEME.secondary} style={{ marginRight: 15 }} />
            <Text style={styles.menuRowText}>Order History</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('Payment', 'Payment methods coming soon!')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="credit-card-outline" size={24} color={THEME.secondary} style={{ marginRight: 15 }} />
            <Text style={styles.menuRowText}>Payment Methods</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Edit Profile Screen
function EditProfileScreen({ user, onSave, onBack }: { user: User; onSave: (data: Partial<User>) => void; onBack: () => void }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setLoading(true);
    await onSave({ name, phone });
    setLoading(false);
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Edit Profile</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Email (Cannot be changed)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f0f0f0', color: '#999' }]}
          value={user.email}
          editable={false}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Address List Screen
function AddressListScreen({ addresses, onAdd, onEdit, onDelete, onBack }: { addresses: Address[]; onAdd: () => void; onEdit: (address: Address) => void; onDelete: (id: number) => void; onBack: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Saved Addresses</Text>
      </View>
      <FlatList
        data={addresses}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addNewAddressButton} onPress={onAdd}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="plus-circle-outline" size={24} color={THEME.secondary} style={{ marginRight: 8 }} />
              <Text style={styles.addNewAddressText}>Add New Address</Text>
            </View>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={item.isDefault ? 'home-circle' : 'map-marker-outline'} size={24} color={item.isDefault ? THEME.primary : THEME.textSecondary} style={{ marginRight: 8 }} />
                <Text style={styles.addressType}>{item.isDefault ? 'Default' : 'Saved Address'}</Text>
              </View>
              <View style={styles.addressActions}>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.actionButton, styles.deleteButton]}>
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.addressText}>{item.street}</Text>
            <Text style={styles.addressText}>{item.city}, {item.state} {item.zip}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centerScreen}>
            <Text style={styles.emptyText}>No saved addresses</Text>
          </View>
        }
      />
    </View>
  );
}

// Add/Edit Address Screen
function AddEditAddressScreen({ address, onSave, onBack }: { address?: Address | null; onSave: (data: any) => void; onBack: () => void }) {
  const [street, setStreet] = useState(address?.street || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [zip, setZip] = useState(address?.zip || '');
  const [isDefault, setIsDefault] = useState(address?.isDefault || false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!street || !city || !zip) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    setLoading(true);
    await onSave({ street, city, state, zip, isDefault });
    setLoading(false);
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{address ? 'Edit Address' : 'Add Address'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.textArea}
          value={street}
          onChangeText={setStreet}
          placeholder="123 Main St, Apt 4B"
          multiline
        />
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="City"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholder="State"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={zip}
              onChangeText={setZip}
              placeholder="ZIP Code"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsDefault(!isDefault)}>
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault && <Icon name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Set as Default Address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="content-save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>{address ? 'Save Changes' : 'Add Address'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Admin Dashboard Screen
function AdminDashboardScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.centerScreen}><ActivityIndicator size="large" color="#FF6B35" /></View>;

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Admin Hub</Text>
        <Text style={styles.userName}>Store Overview ✨</Text>
      </View>

      <View style={styles.adminStatsRow}>
        <View style={styles.statCard}>
          <Icon name="basket-check" size={28} color={THEME.secondary} />
          <Text style={styles.statValue}>{stats?.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="currency-inr" size={28} color={THEME.secondary} />
          <Text style={styles.statValue}>{stats?.totalRevenue}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="alert-circle-outline" size={28} color={THEME.error} />
          <Text style={styles.statValue}>{stats?.lowStockCount}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="account-group" size={28} color={THEME.secondary} />
          <Text style={styles.statValue}>{stats?.activeUsers}</Text>
          <Text style={styles.statLabel}>Active Users</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.adminCard} onPress={() => onNavigate('adminOrders')}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff5f0', padding: 12, borderRadius: 12, marginRight: 15 }}>
            <Icon name="package-variant-closed" size={24} color={THEME.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Manage Orders</Text>
            <Text style={styles.cardText}>Track, confirm, and dispatch customer orders</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.adminCard} onPress={() => onNavigate('adminInventory')}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#eef2ff', padding: 12, borderRadius: 12, marginRight: 15 }}>
            <Icon name="food-apple" size={24} color={THEME.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Inventory Manager</Text>
            <Text style={styles.cardText}>Update stock levels and menu availability</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Admin Orders Screen
function AdminOrdersScreen({ onBack }: { onBack: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      Alert.alert('Success', 'Status updated');
      loadOrders();
    } catch (error) {
      Alert.alert('Error', 'Update failed');
    }
  };

  if (loading) return <View style={styles.centerScreen}><ActivityIndicator size="large" color="#FF6B35" /></View>;

  return (
    <View style={styles.screen}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>All Orders</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.adminCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderIdText}>Order #{item.id}</Text>
              <Text style={styles.orderTotal}>₹{item.total}</Text>
            </View>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={styles.statusText}>Current Status: {item.status.toUpperCase()}</Text>

            <View style={styles.statusButtons}>
              <TouchableOpacity style={[styles.statusBtn, item.status === 'confirmed' && styles.statusBtnActive]} onPress={() => updateStatus(item.id, 'confirmed')}>
                <Text style={[styles.statusBtnText, item.status === 'confirmed' && styles.statusBtnTextActive]}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusBtn, item.status === 'preparing' && styles.statusBtnActive]} onPress={() => updateStatus(item.id, 'preparing')}>
                <Text style={[styles.statusBtnText, item.status === 'preparing' && styles.statusBtnTextActive]}>Prepare</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusBtn, item.status === 'out_for_delivery' && styles.statusBtnActive]} onPress={() => updateStatus(item.id, 'out_for_delivery')}>
                <Text style={[styles.statusBtnText, item.status === 'out_for_delivery' && styles.statusBtnTextActive]}>Dispatch</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusBtn, item.status === 'delivered' && styles.statusBtnActive]} onPress={() => updateStatus(item.id, 'delivered')}>
                <Text style={[styles.statusBtnText, item.status === 'delivered' && styles.statusBtnTextActive]}>Deliver</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// Admin Inventory Screen
function AdminInventoryScreen({ onBack }: { onBack: () => void }) {
  const [inventory, setInventory] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await adminService.getInventory();
      setInventory(data.items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (itemId: number, newStock: number) => {
    try {
      await adminService.updateInventoryItem(itemId, { stockQuantity: newStock });
      Alert.alert('Success', 'Stock updated');
      loadInventory();
    } catch (error) {
      Alert.alert('Error', 'Failed to update stock');
    }
  };

  const toggleAvailability = async (itemId: number, isAvailable: boolean) => {
    try {
      await adminService.updateInventoryItem(itemId, { isAvailable });
      loadInventory();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle availability');
    }
  };

  if (loading) return <View style={styles.centerScreen}><ActivityIndicator size="large" color="#FF6B35" /></View>;

  return (
    <View style={styles.screen}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Manage Inventory</Text>
      </View>
      <FlatList
        data={inventory}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.adminCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="archive-arrow-down-outline" size={20} color={THEME.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.stockInput}
                  defaultValue={item.stockQuantity.toString()}
                  keyboardType="numeric"
                  onSubmitEditing={(e) => updateStock(item.id, parseInt(e.nativeEvent.text))}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => toggleAvailability(item.id, !item.isAvailable)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: item.isAvailable ? '#E8F5E9' : '#FFEBEE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                >
                  <Icon name={item.isAvailable ? 'check-circle' : 'close-circle'} size={18} color={item.isAvailable ? THEME.success : THEME.error} />
                  <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: 'bold', color: item.isAvailable ? THEME.success : THEME.error }}>
                    {item.isAvailable ? 'Available' : 'Hidden'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  content: { flex: 1 },
  screen: { flex: 1, backgroundColor: THEME.background },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.background },

  // Navigation
  navbar: {
    flexDirection: 'row',
    backgroundColor: THEME.cardBg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
    paddingTop: 12,
    ...THEME.shadow,
    shadowOffset: { width: 0, height: -4 }, // Reverse shadow for bottom nav
  },
  navButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, color: THEME.textSecondary, marginTop: 4, fontWeight: '500' },
  navTextActive: { color: THEME.primary, fontWeight: 'bold' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: THEME.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff'
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  // Auth & Login
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    padding: 30,
    borderWidth: 10,
    borderColor: 'rgba(255,255,255,0.1)' // Subtle but visible update marker
  },
  appTitle: { fontSize: 42, fontWeight: 'bold', color: THEME.accent, marginBottom: 4, letterSpacing: -1, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#fff', marginBottom: 50, opacity: 0.95, fontWeight: 'bold', textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#fff', padding: 18, borderRadius: THEME.radius, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  textArea: { width: '100%', backgroundColor: '#fff', padding: 18, borderRadius: THEME.radius, marginBottom: 15, fontSize: 16, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#eee' },
  loginButton: { width: '100%', backgroundColor: THEME.secondary, padding: 20, borderRadius: THEME.radius, alignItems: 'center', marginBottom: 25, ...THEME.shadow },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  hint: { color: '#fff', fontSize: 13, opacity: 0.9, textAlign: 'center', marginTop: 10, backgroundColor: 'rgba(0,0,0,0.1)', padding: 10, borderRadius: 10 },

  // Home & Headers
  header: {
    backgroundColor: THEME.primary,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...THEME.shadow
  },
  greeting: { fontSize: 16, color: '#fff', opacity: 0.85, fontWeight: '500' },
  userName: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  card: {
    backgroundColor: THEME.cardBg,
    margin: 16,
    padding: 24,
    borderRadius: THEME.radius + 4,
    ...THEME.shadow
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 14, color: THEME.textMain },
  cardText: { fontSize: 15, color: THEME.textSecondary, marginBottom: 10, lineHeight: 22 },
  sectionTitleOutside: { fontSize: 22, fontWeight: 'bold', margin: 20, marginBottom: 10, color: THEME.textMain },

  // Menu Header
  menuHeader: {
    backgroundColor: THEME.primary,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  menuTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 20,
    ...THEME.shadow
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: THEME.textMain, height: '100%' },

  // Category Chips
  categoriesContainer: { marginBottom: 20 },
  categoriesContent: { paddingRight: 24 },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  categoryChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  categoryChipText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  categoryChipTextActive: { color: THEME.primary, fontWeight: 'bold' },

  // Sort
  sortContainer: { flexDirection: 'row', alignItems: 'center' },
  sortLabel: { color: '#fff', marginRight: 10, fontWeight: '600', fontSize: 14 },
  sortButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8
  },
  sortButtonActive: { backgroundColor: '#fff' },
  sortButtonText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  sortButtonTextActive: { color: THEME.primary, fontWeight: 'bold' },

  // Menu Grid & Cards
  menuGrid: { padding: 12, paddingBottom: 100 },
  menuCard: {
    flex: 1,
    backgroundColor: THEME.cardBg,
    margin: 8,
    borderRadius: THEME.radius,
    overflow: 'hidden',
    ...THEME.shadow,
  },
  menuCardImage: {
    height: 120,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  foodEmoji: { fontSize: 50 },
  menuCardContent: { padding: 16 },
  menuCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  menuCardName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: THEME.textMain, marginRight: 4, height: 44 },
  categoryBadge: { backgroundColor: '#fff5f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  categoryBadgeText: { fontSize: 10, fontWeight: 'bold', color: THEME.primary, textTransform: 'uppercase' },
  menuCardDesc: { fontSize: 12, color: THEME.textSecondary, marginBottom: 12, height: 32, lineHeight: 16 },
  menuCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  menuCardPrice: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  addButtonNew: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    ...THEME.shadow,
    elevation: 2
  },
  addButtonTextNew: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Cart Premium
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardBg,
    padding: 20,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 17, fontWeight: 'bold', color: THEME.textMain },
  cartItemPrice: { fontSize: 15, color: THEME.primary, marginTop: 4, fontWeight: '600' },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  quantityButton: { padding: 10, width: 40, alignItems: 'center' },
  quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: THEME.textMain },
  quantity: { paddingHorizontal: 14, fontSize: 16, fontWeight: 'bold', color: THEME.textMain },
  cartFooter: {
    padding: 24,
    backgroundColor: THEME.cardBg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...THEME.shadow
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  totalLabel: { fontSize: 18, color: THEME.textMain, fontWeight: '500' },
  totalAmount: { fontSize: 28, fontWeight: 'bold', color: THEME.primary },
  checkoutButton: { backgroundColor: THEME.primary, padding: 20, borderRadius: THEME.radius, alignItems: 'center', ...THEME.shadow },

  // Checkout Cards
  checkoutCard: {
    backgroundColor: THEME.cardBg,
    margin: 16,
    marginTop: 0,
    padding: 24,
    borderRadius: THEME.radius,
    ...THEME.shadow
  },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 20, color: THEME.textMain },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  summaryItem: { fontSize: 16, color: THEME.textSecondary },
  summaryPrice: { fontSize: 16, fontWeight: '600', color: THEME.textMain },
  summaryTotal: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 16, marginTop: 4 },
  placeOrderButton: { backgroundColor: THEME.secondary, margin: 16, padding: 18, borderRadius: THEME.radius, alignItems: 'center', ...THEME.shadow },
  paymentMethod: { fontSize: 16, color: THEME.textMain, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },

  // Orders & Lists
  orderCard: {
    backgroundColor: THEME.cardBg,
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: THEME.radius,
    ...THEME.shadow
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  statusPending: { backgroundColor: '#FFF3E0' },
  statusConfirmed: { backgroundColor: '#E8F5E9' },
  statusText: { color: THEME.primary, fontSize: 12, fontWeight: 'bold' },
  orderItems: { fontSize: 15, color: THEME.textMain, fontWeight: '600' },
  viewDetailsText: { fontSize: 13, color: THEME.primary, marginTop: 12, fontWeight: 'bold' },

  // Confirmation & Timeline
  confirmationContainer: { flex: 1, backgroundColor: THEME.background, padding: 24, justifyContent: 'center', alignItems: 'center' },
  successIcon: { fontSize: 80, marginBottom: 24 },
  successTitle: { fontSize: 26, fontWeight: 'bold', color: THEME.textMain, textAlign: 'center', marginBottom: 10 },
  successText: { fontSize: 16, color: THEME.textSecondary, marginBottom: 20, textAlign: 'center' },
  timelineStep: { flexDirection: 'row', marginBottom: 20 },
  timelineIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  timelineIconCompleted: { backgroundColor: THEME.primary },
  timelineLabel: { fontSize: 15, color: THEME.textSecondary },
  timelineLabelCompleted: { color: THEME.textMain, fontWeight: 'bold' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#f0f0f0', marginTop: 4, alignSelf: 'center' },
  timelineLineCompleted: { backgroundColor: THEME.primary },

  // Profile & Address
  profileHeader: { alignItems: 'center', backgroundColor: THEME.cardBg, padding: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, ...THEME.shadow },
  profileIcon: {
    fontSize: 60,
    marginBottom: 16,
    backgroundColor: '#fff5f0',
    width: 110,
    height: 110,
    textAlign: 'center',
    lineHeight: 110,
    borderRadius: 55,
    overflow: 'hidden',
    color: THEME.primary,
    borderWidth: 4,
    borderColor: '#fff'
  },
  profileName: { fontSize: 26, fontWeight: 'bold', color: THEME.textMain },
  profileEmail: { fontSize: 16, color: THEME.textSecondary, marginTop: 4 },
  editProfileButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 25, backgroundColor: '#f0f0f0' },
  editProfileButtonText: { color: THEME.secondary, fontWeight: 'bold', fontSize: 14 },
  logoutButton: { margin: 24, backgroundColor: THEME.primary, padding: 18, borderRadius: THEME.radius, alignItems: 'center', ...THEME.shadow },

  // Generic
  emptyIcon: { fontSize: 80, color: '#ddd', marginBottom: 20 },
  emptyText: { fontSize: 20, color: '#999', fontWeight: '500' },
  label: { fontSize: 14, fontWeight: 'bold', color: THEME.textSecondary, marginBottom: 8, marginLeft: 4 },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardBg,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.textMain, marginLeft: 16 },
  primaryButton: { backgroundColor: THEME.primary, padding: 18, borderRadius: THEME.radius, alignItems: 'center', ...THEME.shadow },
  secondaryButton: { backgroundColor: '#fff', padding: 18, borderRadius: THEME.radius, alignItems: 'center', borderWidth: 2, borderColor: THEME.primary },

  // Admin Dashboard
  adminStatsRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  statCard: {
    width: '44%',
    backgroundColor: THEME.cardBg,
    margin: '3%',
    padding: 24,
    borderRadius: THEME.radius,
    ...THEME.shadow
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: THEME.secondary },
  statLabel: { fontSize: 13, color: THEME.textSecondary, marginTop: 6, fontWeight: '500' },

  // Missing Helper Styles
  loadingText: { marginTop: 12, fontSize: 16, color: THEME.textSecondary, fontWeight: '500' },
  clearButton: { padding: 8 },
  hintText: { fontSize: 14, color: THEME.textSecondary, marginTop: 8 },
  backButton: { padding: 8, marginRight: 8 },
  backButtonText: { fontSize: 16, color: THEME.primary, fontWeight: 'bold' },
  addressOption: { marginRight: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff', width: 140 },
  addressOptionSelected: { borderColor: THEME.primary, backgroundColor: '#fff5f0' },
  addressOptionText: { fontSize: 12, color: THEME.textMain },
  addressOptionTextSelected: { color: THEME.primary, fontWeight: 'bold' },
  orderIdText: { fontSize: 14, color: THEME.primary, fontWeight: 'bold' },
  orderDate: { color: THEME.textSecondary, fontSize: 12, marginTop: 4 },
  orderTotal: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  confirmationCard: { backgroundColor: '#fff', padding: 24, borderRadius: THEME.radius, width: '100%', marginBottom: 20, ...THEME.shadow },
  secondaryButtonText: { color: THEME.primary, fontSize: 18, fontWeight: 'bold' },
  detailCard: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: THEME.radius, ...THEME.shadow },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailLabel: { fontSize: 14, color: THEME.textSecondary },
  detailValue: { fontSize: 14, color: THEME.textMain, fontWeight: '600' },
  detailItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailItemInfo: { flex: 1 },
  detailItemName: { fontSize: 15, color: THEME.textMain, fontWeight: '600' },
  detailItemQty: { fontSize: 13, color: THEME.textSecondary },
  detailItemPrice: { fontSize: 15, color: THEME.primary, fontWeight: 'bold' },
  totalDivider: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 12, marginTop: 8 },
  reorderButton: { backgroundColor: THEME.secondary, margin: 16, padding: 18, borderRadius: THEME.radius, alignItems: 'center', ...THEME.shadow },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  menuRowText: { fontSize: 16, color: THEME.textMain },
  menuRowArrow: { fontSize: 20, color: '#ccc' },
  addNewAddressButton: { margin: 16, padding: 20, borderWidth: 1, borderColor: THEME.secondary, borderRadius: THEME.radius, borderStyle: 'dashed', alignItems: 'center' },
  addNewAddressText: { color: THEME.secondary, fontWeight: 'bold', fontSize: 16 },
  addressCard: { backgroundColor: '#fff', padding: 20, marginBottom: 16, borderRadius: THEME.radius, marginHorizontal: 16, ...THEME.shadow },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addressType: { fontWeight: 'bold', color: THEME.textMain, fontSize: 16 },
  addressActions: { flexDirection: 'row' },
  actionButton: { marginLeft: 16, padding: 4 },
  deleteButton: { marginLeft: 16 }, // Added for lint
  actionText: { color: THEME.secondary, fontSize: 14, fontWeight: '600' },
  deleteText: { color: THEME.error },
  addressText: { color: THEME.textSecondary, fontSize: 14, lineHeight: 22 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#ddd', marginRight: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  checkboxChecked: { backgroundColor: THEME.secondary, borderColor: THEME.secondary },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 16, color: THEME.textMain, fontWeight: '500' },
  adminCard: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: THEME.radius, ...THEME.shadow },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0f0f0', marginRight: 8, marginBottom: 8 },
  statusBtnActive: { backgroundColor: THEME.primary },
  statusBtnText: { fontSize: 13, color: THEME.textSecondary },
  statusBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  stockInput: { borderBottomWidth: 2, borderBottomColor: '#eee', padding: 4, width: 70, textAlign: 'center', color: THEME.textMain, fontWeight: 'bold' },

  // Timeline Components
  timelineIconContainer: { alignItems: 'center', marginRight: 16 },
  timelineIconText: { fontSize: 20 },
  timelineLabelContainer: { flex: 1, justifyContent: 'center' },
});
