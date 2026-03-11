/**
 * AppsFlyer Certification Test App — Shop UI
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import appsFlyer from 'react-native-appsflyer';
import { requestTrackingPermission } from 'react-native-tracking-transparency';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const AF_DEV_KEY = 'UHovGDPawJQHgjUo5rFNNZ';
const AF_APP_ID = '111243210';

const AF_BLUE = '#4F35C8';
const BANNER_COLOR = '#3D2DB5';

// ─── DATA ────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  price: number;
  currency: string;
  description: string;
  icon: string;
};

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Elite Runner ZX',
    category: 'FOOTWEAR',
    categoryColor: '#0D9488',
    price: 120,
    currency: 'USD',
    description: 'Breathable mesh with carbon-fiber technology.',
    icon: '👟',
  },
  {
    id: '2',
    name: 'Pro-Audio Buds',
    category: 'ELECTRONICS',
    categoryColor: '#7C3AED',
    price: 89.99,
    currency: 'USD',
    description: 'Premium sound with active noise cancellation.',
    icon: '🎧',
  },
  {
    id: '3',
    name: 'Vantage Smartwatch',
    category: 'WEARABLES',
    categoryColor: '#EA580C',
    price: 199.5,
    currency: 'USD',
    description: 'Advanced fitness tracking with built-in GPS.',
    icon: '⌚',
  },
  {
    id: '4',
    name: 'Lumina Desk Lamp',
    category: 'HOME',
    categoryColor: '#6B7280',
    price: 45,
    currency: 'USD',
    description: 'Smart LED with adjustable brightness and color.',
    icon: '💡',
  },
];

// ─── AF EVENT HELPERS ────────────────────────────────────────────────────────

const logContentView = (product: Product) => {
  appsFlyer.logEvent(
    'af_content_view',
    {
      af_content_id: product.id,
      af_content_type: product.category,
      af_price: product.price,
      af_currency: product.currency,
    },
    () => console.log('af_content_view sent:', product.name),
    (err) => console.error('af_content_view error:', err),
  );
};

const logAddToCart = (product: Product) => {
  appsFlyer.logEvent(
    'af_add_to_cart',
    {
      af_content_id: product.id,
      af_content_type: product.category,
      af_price: product.price,
      af_currency: product.currency,
      af_quantity: 1,
    },
    () => console.log('af_add_to_cart sent:', product.name),
    (err) => console.error('af_add_to_cart error:', err),
  );
};

const logPurchase = (cart: Product[]) => {
  const total = parseFloat(cart.reduce((sum, p) => sum + p.price, 0).toFixed(2));
  appsFlyer.logEvent(
    'af_purchase',
    {
      af_revenue: total,
      af_currency: cart[0]?.currency || 'USD',
      af_content_id: cart.map(p => p.id).join(','),
      af_content_type: cart.map(p => p.category).join(','),
      af_order_id: `order_${Date.now()}`,
      af_quantity: cart.length,
    },
    () => console.log('af_purchase sent, total:', total),
    (err) => console.error('af_purchase error:', err),
  );
};

// ─── SCREENS ─────────────────────────────────────────────────────────────────

type Screen = 'home' | 'product' | 'cart';

// Header shared across screens
function ShopHeader({
  cartCount,
  onCartPress,
  onBack,
}: {
  cartCount: number;
  onCartPress: () => void;
  onBack?: () => void;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity style={styles.backArrowButton} onPress={onBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backArrowButton} />
      )}
      <Text style={styles.headerTitle}>APPSFLYER SHOP</Text>
      <TouchableOpacity style={styles.cartButton} onPress={onCartPress}>
        <Text style={styles.cartIcon}>🛒</Text>
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ── HOME SCREEN ──────────────────────────────────────────────────────────────

function HomeScreen({
  onSelectProduct,
}: {
  onSelectProduct: (p: Product) => void;
}) {
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.homeContent}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Winter Sale!</Text>
        <Text style={styles.bannerSub}>Tap a product to trigger af_content_view</Text>
      </View>

      {/* Product Grid */}
      <Text style={styles.sectionTitle}>Featured Products</Text>
      <View style={styles.grid}>
        {PRODUCTS.map(product => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            activeOpacity={0.8}
            onPress={() => onSelectProduct(product)}
          >
            <View style={styles.productImageBox}>
              <Text style={styles.productEmoji}>{product.icon}</Text>
            </View>
            <Text style={[styles.productCategory, { color: product.categoryColor }]}>
              {product.category}
            </Text>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.productPrice}>${product.price}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ── PRODUCT DETAIL SCREEN ────────────────────────────────────────────────────

function ProductScreen({
  product,
  onBack,
  onAddToCart,
}: {
  product: Product;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
}) {
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.productContent}>
      {/* Product Image */}
      <View style={styles.productDetailImageBox}>
        <Text style={styles.productDetailEmoji}>{product.icon}</Text>
      </View>

      {/* Info */}
      <Text style={styles.productDetailName}>{product.name}</Text>
      <Text style={styles.productDetailPrice}>${product.price}</Text>
      <Text style={styles.productDetailDescription}>{product.description}</Text>

      {/* Add to Cart */}
      <TouchableOpacity
        style={styles.addToCartButton}
        activeOpacity={0.85}
        onPress={() => onAddToCart(product)}
      >
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>

      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>BACK TO BROWSE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── CART SCREEN ──────────────────────────────────────────────────────────────

function CartScreen({
  cart,
  onCheckout,
}: {
  cart: Product[];
  onCheckout: () => void;
}) {
  const total = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.cartContent}>
      <Text style={styles.cartTitle}>Your Cart</Text>

      {cart.length === 0 ? (
        <Text style={styles.cartEmpty}>Empty</Text>
      ) : (
        <>
          {cart.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.cartItem}>
              <Text style={styles.cartItemEmoji}>{item.icon}</Text>
              <Text style={styles.cartItemName}>{item.name}</Text>
              <Text style={styles.cartItemPrice}>${item.price}</Text>
            </View>
          ))}

          <View style={styles.cartDivider} />
          <View style={styles.cartTotalRow}>
            <Text style={styles.cartTotalLabel}>Total</Text>
            <Text style={styles.cartTotalAmount}>${total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            activeOpacity={0.85}
            onPress={onCheckout}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

function App() {
  useEffect(() => {
    // 1. ATT Permission (iOS only)
    if (Platform.OS === 'ios') {
      requestTrackingPermission().then(status => {
        console.log('ATT status:', status);
      });
    }

    // 2. Initialize SDK
    appsFlyer.initSdk(
      {
        devKey: AF_DEV_KEY,
        isDebug: false,
        appId: AF_APP_ID,
        onInstallConversionDataListener: true,
        onDeepLinkListener: true,
        timeToWaitForATTUserAuthorization: 10,
      },
      result => console.log('AppsFlyer SDK initialized:', result),
      error => console.error('AppsFlyer SDK init error:', error),
    );

    // 3. Unified Deep Link (OneLink)
    const unsubDeepLink = appsFlyer.onDeepLink(res => {
      console.log('onDeepLink FULL:', JSON.stringify(res, null, 2));
      if (res?.deepLinkStatus === 'FOUND') {
        const dlv = res?.data?.deep_link_value;
        const sub1 = res?.data?.deep_link_sub1;
        Alert.alert(
          'Deep Link (OneLink)',
          `deep_link_value: ${dlv || 'N/A'}\nsub1: ${sub1 || 'N/A'}`,
        );
      }
    });

    // 4. Install Conversion Data
    const unsubInstall = appsFlyer.onInstallConversionData(res => {
      console.log('onInstallConversionData FULL:', JSON.stringify(res, null, 2));
      if (res?.status === 'success' && res?.data) {
        Alert.alert(
          'Install Conversion Data',
          `is_first_launch: ${res.data.is_first_launch}\nmedia_source: ${res.data.media_source || 'organic'}\ndeep_link_value: ${res.data.deep_link_value || 'N/A'}`,
        );
      }
    });

    // 5. Retargeting
    const unsubAppOpen = appsFlyer.onAppOpenAttribution(res => {
      console.log('onAppOpenAttribution FULL:', JSON.stringify(res, null, 2));
      if (res?.status === 'success' && res?.data) {
        Alert.alert(
          'Retargeting (onAppOpenAttribution)',
          `media_source: ${res.data.media_source || 'N/A'}\ndeep_link_value: ${res.data.deep_link_value || 'N/A'}`,
        );
      }
    });

    return () => {
      try { unsubDeepLink && unsubDeepLink(); } catch (_) {}
      try { unsubInstall && unsubInstall(); } catch (_) {}
      try { unsubAppOpen && unsubAppOpen(); } catch (_) {}
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ShopApp />
    </SafeAreaProvider>
  );
}

// ─── SHOP NAVIGATION ──────────────────────────────────────────────────────────

function ShopApp() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);

  const handleSelectProduct = (product: Product) => {
    logContentView(product);
    setSelectedProduct(product);
    setScreen('product');
  };

  const handleAddToCart = (product: Product) => {
    logAddToCart(product);
    setCart(prev => [...prev, product]);
    setScreen('cart');
  };

  const handleCheckout = () => {
    logPurchase(cart);
    Alert.alert(
      'Order Confirmed!',
      `Purchase of $${cart.reduce((s, p) => s + p.price, 0).toFixed(2)} sent to AppsFlyer.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setCart([]);
            setScreen('home');
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.appContainer, { paddingTop: insets.top }]}>
      <ShopHeader
        cartCount={cart.length}
        onCartPress={() => setScreen('cart')}
        onBack={screen !== 'home' ? () => setScreen('home') : undefined}
      />

      {screen === 'home' && (
        <HomeScreen onSelectProduct={handleSelectProduct} />
      )}
      {screen === 'product' && selectedProduct && (
        <ProductScreen
          product={selectedProduct}
          onBack={() => setScreen('home')}
          onAddToCart={handleAddToCart}
        />
      )}
      {screen === 'cart' && (
        <CartScreen cart={cart} onCheckout={handleCheckout} />
      )}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Back arrow
  backArrowButton: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 36,
    color: AF_BLUE,
    lineHeight: 36,
    marginTop: -4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AF_BLUE,
    letterSpacing: 1,
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartIcon: { fontSize: 24 },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // Home
  homeContent: {
    paddingBottom: 32,
  },
  banner: {
    margin: 16,
    backgroundColor: BANNER_COLOR,
    borderRadius: 12,
    padding: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageBox: {
    height: 90,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  productEmoji: { fontSize: 40 },
  productCategory: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },

  // Product Detail
  productContent: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 48,
  },
  productDetailImageBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  productDetailEmoji: { fontSize: 90 },
  productDetailName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  productDetailPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: AF_BLUE,
    marginBottom: 12,
  },
  productDetailDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  addToCartButton: {
    width: '100%',
    backgroundColor: '#1D1D1F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Cart
  cartContent: {
    padding: 20,
    paddingBottom: 48,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginBottom: 20,
  },
  cartEmpty: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartItemEmoji: { fontSize: 28, marginRight: 12 },
  cartItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  cartDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cartTotalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  cartTotalAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
  },
  checkoutButton: {
    backgroundColor: '#1D1D1F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default App;
