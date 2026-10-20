import { Colors } from '@/constants/Colors';
import { SUPPLIER_ITEM } from '@/data/BarangSupplier';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Link,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Appearance,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Dialog, Divider, Portal, Searchbar } from 'react-native-paper';

export default function MenuBarangSupplier() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [barangList, setBarangList] = useState([]);
  const [visibleDetail, setVisibleDetail] = useState(false);
  const [dataDetail, setDataDetail] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const router = useRouter();
  const { supplier, id_pengadaan } = useLocalSearchParams();
  const selectedSupplierId = supplier ? Number(supplier) : null;
  const selectedIdPengadaan = id_pengadaan ? Number(id_pengadaan) : null;

  const showDialogDetail = (item) => {
    setVisibleDetail(true);
    setDataDetail(item);
  };

  const hideDialogDetail = () => {
    setVisibleDetail(false);
    setDataDetail({});
  };

  const separatorComponent = <View style={styles.separator} />;
  const footerComponent = (
    <Text style={{ color: theme.text }}>Data Barang Terakhir</Text>
  );
  const emptyComponent = (
    <Text style={{ color: theme.text }}>Data Barang Tidak Ditemukan!</Text>
  );

  useEffect(() => {
    const checkStorage = async () => {
      try {
        const supplierData = await AsyncStorage.getItem('SupplierList');
        const barangSupplierData = await AsyncStorage.getItem(
          'BarangSupplierList'
        );
      } catch (e) {
        console.error('Error checking storage:', e);
      }
    };
    checkStorage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('BarangSupplierList');
          const storageBarangSupplier =
            jsonValue != null ? JSON.parse(jsonValue) : null;

          if (storageBarangSupplier && storageBarangSupplier.length) {
            setBarangList(
              storageBarangSupplier.sort(
                (a, b) => b.id_barang_supplier - a.id_barang_supplier
              )
            );
          } else {
            setBarangList(
              SUPPLIER_ITEM.sort(
                (a, b) => b.id_barang_supplier - a.id_barang_supplier
              )
            );
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchData();
    }, [SUPPLIER_ITEM])
  );

  useEffect(() => {
    const storageData = async () => {
      try {
        const jsonValue = JSON.stringify(barangList);
        await AsyncStorage.setItem('BarangSupplierList', jsonValue);
      } catch (e) {
        console.error(e);
      }
    };

    storageData();
  }, [barangList]);

  const removeBarang = async (id_barang_supplier) => {
    try {
      const updatedList = barangList.filter(
        (barang) => barang.id_barang_supplier !== id_barang_supplier
      );
      setBarangList(updatedList);
      await AsyncStorage.setItem(
        'BarangSupplierList',
        JSON.stringify(updatedList)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = barangList.filter(
      (item) =>
        item.nama
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.kode
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.jenis
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.jumlah
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.harga
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        (item.spesifikasi &&
          item.spesifikasi
            .toString()
            .toLowerCase()
            .includes(text.toString().toLowerCase()))
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(barangList);
    }
  }, [barangList]);

  const handlePress = (id) => {
    // router.push(`/barang_supplier/${id}`);
    setSearchQuery('');

    router.push({
      pathname: `/barang_supplier/${id}`,
      params: {
        supplier: selectedSupplierId,
        id_pengadaan: selectedIdPengadaan,
      },
    });
  };

  return (
    <Container style={styles.contentContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Link
          href={{
            pathname: '/form-barang-supplier',
            params: {
              supplier: selectedSupplierId,
              id_pengadaan: selectedIdPengadaan,
            },
          }}
          asChild
        >
          <Button icon="plus" mode="contained" style={styles.button}>
            <Text style={styles.buttonText}>Tambah Barang</Text>
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
        data={
          selectedSupplierId
            ? searchQuery
              ? filteredData.filter(
                  (item) => item.id_supplier === selectedSupplierId
                )
              : barangList.filter(
                  (item) => item.id_supplier === selectedSupplierId
                )
            : searchQuery
            ? filteredData
            : barangList
        }
        keyExtractor={(item) => item.id_barang_supplier.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={separatorComponent}
        ListFooterComponent={footerComponent}
        ListFooterComponentStyle={styles.footerComponent}
        ListEmptyComponent={emptyComponent}
        ListHeaderComponentStyle={styles.footerComponent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.dataMenuRow}>
              <View style={{ padding: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dataItemText}>Nama Barang</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.dataItemText}>: </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.dataItemText}>
                    {item.nama.substring(0, 13)}
                  </Text>
                </View>
              </View>
              <View style={{ padding: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dataItemText}>Kode Barang</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.dataItemText}>: </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.dataItemText}>
                    {item.kode.substring(0, 13)}
                  </Text>
                </View>
              </View>
              <View style={{ padding: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dataItemText}>Jenis Barang</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.dataItemText}>: </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.dataItemText}>
                    {item.jenis.substring(0, 13)}
                  </Text>
                </View>
              </View>
              <Divider />
              <Button
                icon="chevron-right"
                mode="text"
                textColor="gray"
                onPress={() => showDialogDetail(item)}
                style={{ marginHorizontal: 'auto' }}
              >
                Detail
              </Button>
            </View>
            <View
              style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}
            >
              <Pressable
                onPress={() => removeBarang(item.id_barang_supplier)}
                style={{ paddingTop: 15, paddingRight: 10 }}
              >
                <MaterialIcons name="delete" size={24} color={theme.icon} />
              </Pressable>
              <Pressable
                onPress={() => handlePress(item.id_barang_supplier)}
                style={{ paddingTop: 15, paddingRight: 10 }}
              >
                <Feather name="edit" size={24} color={theme.icon} />
              </Pressable>

              <Portal>
                <Dialog
                  visible={visibleDetail}
                  onDismiss={() => hideDialogDetail(item)}
                >
                  <Dialog.Title>Detail Produk Barang Supplier</Dialog.Title>
                  <Dialog.Content>
                    <View style={{ padding: 1, flexDirection: 'row' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dataItemText}>Nama Barang</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.dataItemText}>: </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.dataItemText}>
                          {dataDetail.nama}{' '}
                        </Text>
                      </View>
                    </View>
                    <View style={{ padding: 1, flexDirection: 'row' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dataItemText}>Kode Barang</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.dataItemText}>: </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.dataItemText}>
                          {dataDetail.kode}{' '}
                        </Text>
                      </View>
                    </View>
                    <View style={{ padding: 1, flexDirection: 'row' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dataItemText}>Jenis Barang</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.dataItemText}>: </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.dataItemText}>
                          {dataDetail.jenis}{' '}
                        </Text>
                      </View>
                    </View>
                    <View style={{ padding: 1, flexDirection: 'row' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dataItemText}>Jumlah Barang</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.dataItemText}>: </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.dataItemText}>
                          {dataDetail.jumlah}{' '}
                        </Text>
                      </View>
                    </View>
                    <View style={{ padding: 1, flexDirection: 'row' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dataItemText}>Harga Barang</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.dataItemText}>: </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.dataItemText}>
                          {dataDetail.harga}{' '}
                        </Text>
                      </View>
                    </View>
                    <View style={{ padding: 1, flexDirection: 'row' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dataItemText}>Spesifikasi</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.dataItemText}>: </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.dataItemText}>
                          {dataDetail.spesifikasi || '-'}
                        </Text>
                      </View>
                    </View>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button onPress={() => hideDialogDetail(item)}>
                      Selesai
                    </Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            </View>
          </View>
        )}
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
