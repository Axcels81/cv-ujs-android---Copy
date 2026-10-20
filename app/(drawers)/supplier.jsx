import { Colors } from '@/constants/Colors';
import { SUPPLIER_LIST } from '@/data/Supplier';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Appearance,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  Divider,
  Portal,
  Searchbar,
  Text,
} from 'react-native-paper';
import { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuSupplier() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
  const [supplierList, setSupplierList] = useState([]);
  const [visibleDetail, setVisibleDetail] = useState(false);
  const [dataDetail, setDataDetail] = useState({});
  const [pengadaanData, setPengadaanData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchPengadaan = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('PengadaanList');
          const data = jsonValue != null ? JSON.parse(jsonValue) : [];
          setPengadaanData(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchPengadaan();
    }, [])
  );

  // Helper to get nama_pengadaan from id_pengadaan
  const getNamaPengadaan = (id_pengadaan) => {
    const parsedId = Number(id_pengadaan); // ensure it's a number
    const found = pengadaanData.find(
      (p) => Number(p.id_pengadaan) === parsedId
    );
    return found ? found.nama_pengadaan : '-';
  };

  const showDialogDetail = (item) => {
    setVisibleDetail(true);
    setDataDetail(item);
  };
  const hideDialogDetail = () => {
    setVisibleDetail(false);
    setDataDetail({});
  };

  const modalStyle = {
    backgroundColor: theme.background,
  };

  const separatorComponent = <View style={styles.separator} />;
  const footerComponent = (
    <Text style={{ color: theme.text }}>Data Supplier Terakhir</Text>
  );
  const emptyComponent = (
    <Text style={{ color: theme.text }}>Data Supplier Tidak Ditemukan!</Text>
  );

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('SupplierList');
          let storageSupplier = jsonValue != null ? JSON.parse(jsonValue) : [];

          // Filter out any invalid items
          storageSupplier = storageSupplier.filter(
            (item) =>
              item &&
              item.id_supplier !== undefined &&
              item.id_supplier !== null
          );

          if (storageSupplier.length) {
            setSupplierList(
              storageSupplier.sort((a, b) => b.id_supplier - a.id_supplier)
            );
          } else {
            // Only use default if no valid items in storage
            const defaultSuppliers = SUPPLIER_LIST.filter(
              (item) =>
                item &&
                item.id_supplier !== undefined &&
                item.id_supplier !== null
            );
            setSupplierList(
              defaultSuppliers.sort((a, b) => b.id_supplier - a.id_supplier)
            );
          }
        } catch (e) {
          console.error('Error fetching supplier data:', e);
          // On error, use default suppliers
          const defaultSuppliers = SUPPLIER_LIST.filter(
            (item) =>
              item &&
              item.id_supplier !== undefined &&
              item.id_supplier !== null
          );
          setSupplierList(
            defaultSuppliers.sort((a, b) => b.id_supplier - a.id_supplier)
          );
        }
      };
      fetchData();
    }, [])
  );

  const removePengadaan = async (id) => {
    try {
      if (id === undefined || id === null) {
        console.error('Invalid ID for removal:', id);
        return;
      }

      const updatedList = supplierList.filter(
        (supplier) =>
          supplier &&
          supplier.id_supplier !== undefined &&
          supplier.id_supplier !== null &&
          supplier.id_supplier !== id
      );

      await AsyncStorage.setItem('SupplierList', JSON.stringify(updatedList));
      setSupplierList(updatedList);
    } catch (error) {
      console.error('Error removing supplier:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = supplierList.filter(
      (item) =>
        item.nama_supplier
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.no_telepon
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        getNamaPengadaan(item.id_pengadaan)
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.tanggal_input_supplier
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase())
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(supplierList);
    }
  }, [supplierList]);

  const handlePress = (item) => {
    // If item is a number, it might be the ID itself
    setSearchQuery('');
    if (typeof item === 'number') {
      const supplier = supplierList.find((s) => s && s.id_supplier === item);
      if (supplier) {
        router.push({
          pathname: `/supplier/${item}`,
          params: {
            id_pengadaan: supplier.id_pengadaan,
          },
        });
      } else {
        console.error('Supplier not found with ID:', item);
      }
      return;
    }

    // Original handling for object parameter
    if (!item || item.id_supplier === undefined || item.id_supplier === null) {
      console.error('Invalid item or missing id_supplier:', item);
      return;
    }

    const supplierId = Number(item.id_supplier);
    if (isNaN(supplierId)) {
      console.error('Invalid supplier ID:', item.id_supplier);
      return;
    }

    router.push({
      pathname: `/supplier/${supplierId}`,
      params: {
        id_pengadaan: item.id_pengadaan,
      },
    });
  };

  useEffect(() => {}, [supplierList]);

  const fixDuplicateSuppliers = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('SupplierList');
      let storageSupplier = jsonValue != null ? JSON.parse(jsonValue) : [];

      // Remove duplicates by keeping the last occurrence
      const uniqueSuppliers = storageSupplier
        .filter(
          (item) =>
            item && item.id_supplier !== undefined && item.id_supplier !== null
        )
        .reverse()
        .filter(
          (item, index, self) =>
            index === self.findIndex((s) => s.id_supplier === item.id_supplier)
        )
        .reverse();

      await AsyncStorage.setItem(
        'SupplierList',
        JSON.stringify(uniqueSuppliers)
      );
      setSupplierList(
        uniqueSuppliers.sort((a, b) => b.id_supplier - a.id_supplier)
      );
    } catch (error) {
      console.error('Error fixing duplicate suppliers:', error);
    }
  };

  // Call this once to fix duplicates
  // fixDuplicateSuppliers();

  return (
    <Container style={styles.contentContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Link href="/form-supplier" asChild>
          <Button icon="plus" mode="contained" style={styles.button}>
            <Text style={styles.buttonText}>Tambah Suppplier</Text>
          </Button>
        </Link>
        <Searchbar
          placeholder="Search"
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ flex: 1 }}
        />
      </View>
      <FlatList
        data={searchQuery ? filteredData : supplierList}
        keyExtractor={(item, index) => {
          if (
            !item ||
            item.id_supplier === undefined ||
            item.id_supplier === null
          ) {
            console.error('Invalid item in list at index:', index, item);
            return `invalid-${index}-${Date.now()}`;
          }
          return `supplier-${item.id_supplier}-${index}`; // Added index to ensure uniqueness
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={separatorComponent}
        ListFooterComponent={footerComponent}
        ListFooterComponentStyle={styles.footerComponent}
        ListEmptyComponent={emptyComponent}
        ListHeaderComponentStyle={styles.footerComponent}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => {
          if (
            !item ||
            item.id_supplier === undefined ||
            item.id_supplier === null
          ) {
            console.error('Invalid item in render:', { item });
            return null; // Skip rendering invalid items
          }
          return (
            <View style={{ flex: 1, flexDirection: 'row', width: '100%' }}>
              <View style={styles.row}>
                <View style={styles.dataMenuRow}>
                  <View style={{ padding: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataItemText}>Nama Supplier</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.dataItemText}>: </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.dataItemText}>
                        {item.nama_supplier.substring(0, 14)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ padding: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataItemText}>No Telepon</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.dataItemText}>: </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.dataItemText}>
                        {item.no_telepon.substring(0, 14)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ padding: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataItemText}>Pengadaan</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.dataItemText}>: </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.dataItemText}>
                        {getNamaPengadaan(item.id_pengadaan).substring(0, 14)}
                      </Text>
                    </View>
                  </View>
                  <Divider />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}
                  >
                    <Button
                      mode="text"
                      onPress={() =>
                        router.push({
                          pathname: '/barang-supplier',
                          params: {
                            supplier: item.id_supplier,
                            id_pengadaan: item.id_pengadaan,
                          },
                        })
                      }
                      contentContainerStyle={modalStyle}
                      style={{ marginHorizontal: 'auto' }}
                    >
                      Kelola Data
                    </Button>
                    <Button
                      icon="chevron-right"
                      mode="text"
                      textColor="gray"
                      onPress={() => showDialogDetail(item)}
                      contentContainerStyle={modalStyle}
                      style={{ marginHorizontal: 'auto' }}
                    >
                      Detail
                    </Button>
                  </View>
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Pressable
                    onPress={() => removePengadaan(item.id_supplier)}
                    style={{ paddingTop: 15, paddingRight: 10 }}
                  >
                    <MaterialIcons
                      name="delete"
                      size={24}
                      color={theme.icon}
                      selectable={undefined}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => handlePress(item.id_supplier)}
                    style={{ paddingTop: 15, paddingRight: 10 }}
                  >
                    <Feather
                      name="edit"
                      size={24}
                      color={theme.icon}
                      selectable={undefined}
                    />
                  </Pressable>
                  <Portal>
                    <Dialog
                      visible={visibleDetail}
                      onDismiss={hideDialogDetail}
                    >
                      <Dialog.Title>Detail Supplier</Dialog.Title>
                      <Dialog.Content>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>
                              Nama Supplier
                            </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.nama_supplier}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>No Telepon</Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.no_telepon}
                            </Text>
                          </View>
                        </View>
                        {/* <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>
                              Jumlah Barang
                            </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.jumlah_barang}
                            </Text>
                          </View>
                        </View> */}
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>
                              Tanggal Input
                            </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.tanggal_input_supplier}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>
                              Nama Pengadaan
                            </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {getNamaPengadaan(dataDetail.id_pengadaan)}
                            </Text>
                          </View>
                        </View>
                      </Dialog.Content>
                      <Dialog.Actions>
                        <Button onPress={hideDialogDetail}>Tutup</Button>
                      </Dialog.Actions>
                    </Dialog>
                  </Portal>
                </View>
              </View>
            </View>
          );
        }}
      />
    </Container>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    contentContainer: {
      paddingTop: 10,
      paddingBottom: 20,
      paddingHorizontal: 12,
      backgroundColor: theme.background,
    },
    separator: {
      height: 1,
      backgroundColor: colorScheme === 'dark' ? 'papayawhip' : '#000',
      width: '50%',
      maxWidth: 300,
      marginHorizontal: 'auto',
      marginBottom: 10,
    },
    footerComponent: {
      marginHorizontal: 'auto',
    },
    row: {
      flexDirection: 'row',
      width: '100%',
      maxWidth: 600,
      height: 120,
      marginBottom: 10,
      borderStyle: 'solid',
      borderColor: colorScheme === 'dark' ? 'papayawhip' : '#000',
      borderWidth: 1,
      borderRadius: 20,
      overflow: 'hidden',
      marginHorizontal: 'auto',
    },
    dataMenuRow: {
      width: '85%',
      paddingTop: 10,
      paddingLeft: 10,
      paddingRight: 5,
      flexGrow: 1,
    },
    dataItemText: {
      color: theme.text,
    },
    button: {
      backgroundColor: colorScheme === 'dark' ? 'white' : '#000',
      justifyContent: 'flex-start',
    },
    buttonText: {
      color: colorScheme === 'dark' ? 'black' : 'white',
      fontSize: 16,
      textAlign: 'center',
      padding: 4,
    },
  });
}
