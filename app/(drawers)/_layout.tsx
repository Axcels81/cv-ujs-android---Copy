import { Colors } from '@/constants/Colors';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Appearance, Image, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer as DrawerPaper, Icon, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Redirect } from 'expo-router';
import { useSession } from '../stores/ctx';

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function DrawersLayout() {
  const colorScheme = Appearance.getColorScheme();

  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { session, isLoading, signOut } = useSession();

  // const [loaded] = useFonts({
  //   SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  // });

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href={'../sign-in'} />;
  }
  function CustomDrawerContent({
    navigation,
    state,
  }: DrawerContentComponentProps) {
    return (
      <View style={{ flex: 1, backgroundColor: '#212936' }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{ fontWeight: 'bold', fontSize: 18, color: '#e8def8' }}
                >
                  Main Menu
                </Text>
                {/* <Icon
                source={require('../../assets/images/logo-cvujs.png')}
                size={50}
              /> */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('../../assets/images/logo-cvujs.png')}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 16,
                      color: '#e8def8',
                    }}
                  >
                    {'\t'}CV. UJS
                  </Text>
                </View>
              </View>
              <DrawerPaper.Section>
                {/* <DrawerPaper.Section title="Main Menu"> */}
                <DrawerPaper.Item
                  label="Home"
                  active={state.routes[state.index].name === 'index'}
                  icon="home"
                  onPress={() => navigation.navigate('index')}
                />
                <DrawerPaper.Item
                  label="Pengadaan"
                  icon="file-document"
                  active={state.routes[state.index].name === 'pengadaan'}
                  onPress={() => navigation.navigate('pengadaan')}
                />
                <DrawerPaper.Item
                  label="Supplier"
                  icon="account-group"
                  active={state.routes[state.index].name === 'supplier'}
                  onPress={() => navigation.navigate('supplier')}
                />
                <DrawerPaper.Item
                  label="Perbandingan Harga"
                  icon="chart-bar"
                  active={
                    state.routes[state.index].name === 'perbandingan-harga'
                  }
                  onPress={() => navigation.navigate('perbandingan-harga')}
                />
                <DrawerPaper.Item
                  label="Purchase Order"
                  icon="email-newsletter"
                  active={
                    state.routes[state.index].name === 'list_purchase_order'
                  }
                  onPress={() => navigation.navigate('list_purchase_order')}
                />
                <DrawerPaper.Item
                  label="Laporan"
                  icon="notebook"
                  active={state.routes[state.index].name === 'laporan'}
                  onPress={() => navigation.navigate('laporan')}
                />
              </DrawerPaper.Section>
            </View>
            <DrawerPaper.Section>
              <DrawerPaper.Item
                label="Logout"
                icon="logout"
                onPress={() => {
                  signOut();
                }}
              />
            </DrawerPaper.Section>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // if (!loaded) {
  //   return null;
  // }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        {/* <Stack screenOptions={{ headerStyle: {backgroundColor: theme.headerBackgrond}, headerTintColor: theme.text, headerShadowVisible: false}}>
          <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
          <Stack.Screen name="pengadaan" options={{ headerShown: true, title: 'TabTwoScreen', headerTitle: 'Pengadaan', headerRight: () => <Button onPress={() => console.log("test")} title="Update count" />, }} />
          <Stack.Screen name="barang-pengadaan" options={{ headerShown: true, title: 'Barang-Pengadaan', headerTitle: 'Barang Pengadaan' }} />
          <Stack.Screen name="barang_pengadaan/[id]" options={{ headerShown: true, headerTitle: 'Barang Pengadaan' }} />
          <Stack.Screen name="form-barang-pengadaan" options={{ headerShown: true, title: 'Form Barang-Pengadaan', headerTitle: 'Form Barang Pengadaan' }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false}} />
        </Stack> */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerRight: () => (
                <Icon
                  size={35}
                  source={require('../../assets/images/logo-cvujs.png')}
                />
                // <Icon
                //   source={require('../../assets/images/logo-cvujs.png')}
                //   size={50}
                // />
              ),
            }}
          >
            <Drawer.Screen
              name="index" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Home',
                title: 'Beranda',
              }}
            />
            {/* <Drawer.Screen
              name="index"
              options={{
                drawerLabel: ({ color }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: 140,
                    }}
                  >
                    <Text style={{ color, fontWeight: 'bold', fontSize: 16 }}>
                      Beranda
                    </Text>
                    <Image
                      source={require('../../assets/images/logo-cvujs.png')}
                      style={{ width: 28, height: 28, marginLeft: 12 }}
                      resizeMode="contain"
                    />
                  </View>
                ),
                title: 'Beranda',
              }}
            /> */}
            <Drawer.Screen
              name="pengadaan" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Pengadaan',
                title: 'Pengadaan',
              }}
            />
            <Drawer.Screen
              name="form-pengadaan" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Pengadaan',
                title: 'Pengadaan',
              }}
            />
            <Drawer.Screen
              name="pengadaan/[id]" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Pengadaan',
                title: 'Pengadaan',
              }}
            />
            <Drawer.Screen
              name="barang-pengadaan" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Barang Pengadaan',
                title: 'Barang Pengadaan',
              }}
            />
            <Drawer.Screen
              name="form-barang-pengadaan" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Barang Pengadaan',
                title: 'Barang Pengadaan',
              }}
            />
            <Drawer.Screen
              name="barang_pengadaan/[id]" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Barang Pengadaan',
                title: 'Barang Pengadaan',
              }}
            />
            <Drawer.Screen
              name="supplier" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Supplier',
                title: 'Supplier',
              }}
            />
            <Drawer.Screen
              name="form-supplier" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Supplier',
                title: 'Supplier',
              }}
            />
            <Drawer.Screen
              name="supplier/[id]" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Supplier',
                title: 'Supplier',
              }}
            />
            <Drawer.Screen
              name="barang-supplier" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Barang Supplier',
                title: 'Barang Supplier',
              }}
            />
            <Drawer.Screen
              name="form-barang-supplier" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Barang Supplier',
                title: 'Barang Supplier',
              }}
            />
            <Drawer.Screen
              name="barang_supplier/[id]" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Barang Supplier',
                title: 'Barang Supplier',
              }}
            />
            <Drawer.Screen
              name="perbandingan-harga" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Perbandingan Harga',
                title: 'Perbandingan Harga',
              }}
            />
            <Drawer.Screen
              name="form-perbandingan-harga" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Perbandingan Harga',
                title: 'Perbandingan Harga',
              }}
            />
            <Drawer.Screen
              name="perbandingan_harga/[id]" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Perbandingan Harga',
                title: 'Perbandingan Harga',
              }}
            />
            <Drawer.Screen
              name="purchase_order" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Purchase Order',
                title: 'Purchase Order',
              }}
            />
            <Drawer.Screen
              name="list_purchase_order" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Purchase Order',
                title: 'Purchase Order',
              }}
            />
            <Drawer.Screen
              name="laporan" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Laporan',
                title: 'Laporan',
              }}
            />
            <Drawer.Screen
              name="test" // This is the name of the page and must match the url from root
              options={{
                drawerLabel: 'Test',
                title: 'Test',
              }}
            />
          </Drawer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
