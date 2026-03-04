/**
 * AppsFlyer Certification Test App
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  Alert,
  Button,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import appsFlyer from 'react-native-appsflyer';
import { requestTrackingPermission } from 'react-native-tracking-transparency';

const AF_DEV_KEY = 'UHovGDPawJQHgjUo5rFNNZ';
const AF_APP_ID = '111243210'; // iOS App ID sin el prefijo "id"

// --- EVENT FUNCTIONS ---

const logContentView = () => {
  appsFlyer.logEvent(
    'af_content_view',
    { af_content_id: 'product_A1', af_content_type: 'shoe' },
    () => { Alert.alert('Event Sent', 'Content View registered.'); },
    (error) => { console.error(error); }
  );
};

const logAddToCart = () => {
  appsFlyer.logEvent(
    'af_add_to_cart',
    { af_content_id: 'product_A1', af_price: 99.99, af_quantity: 1 },
    () => { Alert.alert('Event Sent', 'Add to Cart registered.'); },
    (error) => { console.error(error); }
  );
};

const logPurchaseWithRevenue = () => {
  appsFlyer.logEvent(
    'af_purchase',
    {
      af_revenue: '99.99',
      af_currency: 'MXN',
      af_content_id: 'product_A1',
      af_order_id: 'order_001',
    },
    () => { Alert.alert('Event Sent', 'Purchase with Revenue registered!'); },
    (error) => { console.error(error); }
  );
};


// --- MAIN COMPONENT ---
function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // 1. REQUEST ATT PERMISSION (iOS only) — must be before SDK init
    if (Platform.OS === 'ios') {
      requestTrackingPermission().then((status) => {
        console.log('ATT status:', status);
      });
    }

    // 2. INITIALIZE SDK
    appsFlyer.initSdk(
      {
        devKey: AF_DEV_KEY,
        isDebug: true, // set false for production
        appId: AF_APP_ID,
        onInstallConversionDataListener: true,
        onDeepLinkListener: true,
        timeToWaitForATTUserAuthorization: 10,
      },
      (result) => { console.log('AppsFlyer SDK initialized:', result); },
      (error) => { console.error('AppsFlyer SDK init error:', error); }
    );

    // 2. UNIFIED DEEP LINKING (onDeepLink) — handles both direct and deferred deep links via OneLink
    const unsubDeepLink = appsFlyer.onDeepLink((res) => {
      console.log('onDeepLink FULL:', JSON.stringify(res, null, 2));

      if (res?.deepLinkStatus === 'FOUND') {
        const dlv = res?.data?.deep_link_value;
        const sub1 = res?.data?.deep_link_sub1;
        Alert.alert(
          'Deep Link (OneLink)',
          `deep_link_value: ${dlv || 'N/A'}\nsub1: ${sub1 || 'N/A'}`
        );
      } else if (res?.deepLinkStatus === 'NOT_FOUND') {
        console.log('Deep link not found');
      }
    });

    // 3. INSTALL CONVERSION DATA — for deferred deep links on first install
    const unsubInstall = appsFlyer.onInstallConversionData((res) => {
      console.log('onInstallConversionData FULL:', JSON.stringify(res, null, 2));

      if (res?.status === 'success' && res?.data) {
        const isFirstLaunch = res.data.is_first_launch;
        const mediaSource = res.data.media_source;
        Alert.alert(
          'Install Conversion Data',
          `is_first_launch: ${isFirstLaunch}\nmedia_source: ${mediaSource || 'organic'}\ndeep_link_value: ${res.data.deep_link_value || 'N/A'}`
        );
      }
    });

    // 4. APP OPEN ATTRIBUTION — for retargeting re-engagement
    const unsubAppOpen = appsFlyer.onAppOpenAttribution((res) => {
      console.log('onAppOpenAttribution FULL:', JSON.stringify(res, null, 2));

      if (res?.status === 'success' && res?.data) {
        Alert.alert(
          'Retargeting (onAppOpenAttribution)',
          `media_source: ${res.data.media_source || 'N/A'}\ndeep_link_value: ${res.data.deep_link_value || 'N/A'}`
        );
      }
    });

    return () => {
      try { unsubDeepLink && unsubDeepLink(); } catch (e) { }
      try { unsubInstall && unsubInstall(); } catch (e) { }
      try { unsubAppOpen && unsubAppOpen(); } catch (e) { }
    };
  }, []);


  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

// --- CONTENT COMPONENT ---
function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top + 20 }]}>
      <Text style={styles.title}>AppsFlyer Certification</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS.toUpperCase()}</Text>

      <View style={styles.buttonContainer}>
        <Button title="1. Content View" onPress={logContentView} />
        <Button title="2. Add to Cart" onPress={logAddToCart} />
        <Button title="3. Purchase (w/ Revenue)" onPress={logPurchaseWithRevenue} color="green" />

        <Text style={styles.note}>
          Test events and verify in AppsFlyer Live Events.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    gap: 15,
  },
  note: {
    marginTop: 30,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  }
});

export default App;
