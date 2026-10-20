import { useRouter } from 'expo-router';
import {
  Appearance,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

export default function MenuPurchaseOrder() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [namaPurchaseOrder, setNamaPurchaseOrder] = useState([]);
  const [filteredProcApp, setFilteredProcApp] = useState([]);
  const [idPengadaan, setIdPengadaan] = useState('');
  const [idSupplier, setIdSupplier] = useState('');
  const [idBarang, setIdBarang] = useState('');
  const [namaPerbandinganHarga, setNamaPerbandinganHarga] = useState('');
  const [hargaPerbandinganHarga, setHargaPerbandinganHarga] = useState('');

  const hasError = namaPurchaseOrder === '';
  const errorText = hasError ? '*Semua field harus diisi' : '';

  const router = useRouter();

  const [pengadaanOptions, setPengadaanOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [barangOptions, setBarangOptions] = useState([]);
  const [barangPengadaanData, setBarangPengadaanData] = useState([]);
  const [barangSupplierData, setBarangSupplierData] = useState([]);
  const [openPengadaan, setOpenPengadaan] = useState(false);
  const [openBarang, setOpenBarang] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [namaPengadaan, setNamaPengadaan] = useState('');
  const [kontakSupplier, setKontakSupplier] = useState('');
  const [namaSupplier, setNamaSupplier] = useState('');
  const [open, setOpen] = useState(false);

  const [perbandinganHargaItems, setPerbandinganHargaItems] = useState([]);

  const resetForm = () => {
    setNamaPurchaseOrder('');
    setIdPengadaan('');
    setIdSupplier('');
    setIdBarang('');
    setNamaPerbandinganHarga('');
    setHargaPerbandinganHarga('');
    setNamaPengadaan('');
    setKontakSupplier('');
    setNamaSupplier('');
  };

  useEffect(() => {
    const fetchPerbandinganHarga = async () => {
      const jsonValue = await AsyncStorage.getItem('PerbandinganHargaList');
      const list = jsonValue ? JSON.parse(jsonValue) : [];

      const jsonValueBarangPengadaan = await AsyncStorage.getItem('ProcApp');
      const dataBarangPengadaan =
        jsonValueBarangPengadaan != null
          ? JSON.parse(jsonValueBarangPengadaan)
          : [];
      // Filter by id_pengadaan and id_supplier
      const filtered = list.filter(
        (item) =>
          Number(item.id_pengadaan) === Number(idPengadaan) &&
          Number(item.id_supplier) === Number(idSupplier)
      );
      setPerbandinganHargaItems(filtered);
      setBarangPengadaanData(dataBarangPengadaan);
    };
    fetchPerbandinganHarga();
  }, [idPengadaan, idSupplier]);

  const addPerbandinganHargaItem = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('PerbandinganHargaList');
      const storagePerbandinganHarga =
        jsonValue != null ? JSON.parse(jsonValue) : [];
      const newID =
        storagePerbandinganHarga.length > 0
          ? storagePerbandinganHarga[0].id_perbandingan_harga + 1
          : 1;
      const newData = [
        {
          id_perbandingan_harga: newID,
          id_pengadaan: idPengadaan,
          id_supplier: idSupplier,
          id_barang: idBarang,
          id_barang_supplier: idSupplier,
          nama_perbandingan_harga: namaPerbandinganHarga,
          harga_perbandingan_harga: hargaPerbandinganHarga,
        },
        ...storagePerbandinganHarga,
      ];
      await AsyncStorage.setItem(
        'PerbandinganHargaList',
        JSON.stringify(newData)
      );
      setIdPengadaan('');
      setIdSupplier('');
      setIdBarang('');
      setNamaPerbandinganHarga('');
      setHargaPerbandinganHarga('');
      router.push(`/perbandingan-harga`);
    } catch (e) {
      console.error(e);
    }
  };

  const openMenu = (field) => {
    setSelectedField(field);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleSelect = (value) => {
    const selectedItem = filteredProcApp.find((item) => item.nama === value);
    if (selectedItem) {
      setNama(selectedItem.nama); // Set nama
      setKode(selectedItem.kode); // Set kode
      setJenis(selectedItem.jenis); // Set jenis
      setJumlah(selectedItem.jumlah); // Set jumlah
      setIdBarang(selectedItem.id_barang); // Set id_barang based on selected item
    }
    setMenuVisible(false); // Close menu
  };

  const handleOpenDropdown = async () => {
    try {
      const jsonValueBarang = await AsyncStorage.getItem('ProcApp');
      const storageBarang =
        jsonValueBarang != null ? JSON.parse(jsonValueBarang) : [];
      const filteredBarangItems = storageBarang.filter(
        (item) => item.id_pengadaan === Number(id_pengadaan)
      );
      setBarangOptions(filteredBarangItems);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching perbandingan harga options:', error);
    }
  };

  const handlePengadaanOpenDropdown = async () => {
    try {
      const jsonValuePengadaan = await AsyncStorage.getItem('PengadaanList');
      const storagePengadaan =
        jsonValuePengadaan != null ? JSON.parse(jsonValuePengadaan) : null;
      setPengadaanOptions(storagePengadaan);
      setOpenPengadaan(true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSupplierOpenDropdown = async () => {
    try {
      const jsonvalueSupplier = await AsyncStorage.getItem('SupplierList');
      const storageSupplier =
        jsonvalueSupplier != null ? JSON.parse(jsonvalueSupplier) : null;
      const filteredSupplierItems = storageSupplier.filter(
        (item) => item.id_pengadaan === Number(idPengadaan)
      );
      setSupplierOptions(filteredSupplierItems);
      setOpenSupplier(true);
    } catch (e) {
      console.log(e);
    }
  };

  const getNamaBarangPengadaan = (id_barang) => {
    const parsedIdBarang = Number(id_barang); // ensure it's a number
    const found = barangPengadaanData.find(
      (p) => Number(p.id) === parsedIdBarang
    );
    return found ? found.nama : '-';
  };

  const getJumlahBarangPengadaan = (id_barang) => {
    const parsedIdBarang = Number(id_barang);
    const found = barangPengadaanData.find(
      (p) => Number(p.id) === parsedIdBarang
    );
    return found ? found.jumlah : '-';
  };

  const handleInvoice = async () => {
    // Prepare invoice data from your state
    const invoice = {
      number: idPengadaan,
      date: new Date().toLocaleDateString(),
      supplier: namaSupplier,
      items: perbandinganHargaItems.map((item) => ({
        nama: item.nama_perbandingan_harga,
        jumlah: item.jumlah_barang || 1,
        harga: item.harga_perbandingan_harga,
      })),
    };

    // Generate HTML string for the invoice
    const html = `
        <html>
          <body>
            <h1>Purchase Order</h1>
            <p>Nomor: ${invoice.number}</p>
            <p>Tanggal: ${invoice.date}</p>
            <p>Supplier: ${invoice.supplier}</p>
            <table border="1" style="width:100%;border-collapse:collapse;">
              <tr>
                <th>Nama Barang</th>
                <th>Jumlah</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
              ${invoice.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.nama}</td>
                  <td>${item.jumlah}</td>
                  <td>${item.harga}</td>
                  <td>${item.jumlah * item.harga}</td>
                </tr>
              `
                )
                .join('')}
            </table>
            <p>Total: ${invoice.items.reduce(
              (sum, i) => sum + i.jumlah * i.harga,
              0
            )}</p>
          </body>
        </html>
      `;

    // Create PDF
    const options = {
      html,
      fileName: `purchase-order-${invoice.number}`,
      directory: 'Documents',
    };

    try {
      const file = await RNHTMLtoPDF.convert(options);
      await Sharing.shareAsync(file.filePath);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    }
  };

  const generatePdfs = async () => {
    // use a normalized date string for grouping
    const invoiceDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // compute next sequence number for this date
    let sequence = 1;
    const suratPO = await AsyncStorage.getItem('PurchaseOrderList');
    const purchaseOrders = suratPO ? JSON.parse(suratPO) : [];

    // find max sequence for same date
    const maxSeq = purchaseOrders
      .filter((po) => po.date === invoiceDate)
      .reduce((max, po) => {
        const s = Number(po.sequence || po.number || 0);
        return Number.isFinite(s) ? Math.max(max, s) : max;
      }, 0);

    sequence = maxSeq + 1;

    // prepare invoice object with sequence and readable number
    const invoiceNumber = `${String(sequence).padStart(3, '0')}`; // example: 20251029-001

    const invoice = {
      sequence,
      number: invoiceNumber,
      date: invoiceDate,
      supplier: namaSupplier,
      kontak: kontakSupplier,
      nama: namaPurchaseOrder,
      items: perbandinganHargaItems
        .filter((item) => {
          // Only include items that exist in barangPengadaanData and have a valid name
          const nama = getNamaBarangPengadaan(item.id_barang);
          const jumlah = getJumlahBarangPengadaan(item.id_barang);
          return nama && nama !== '-' && jumlah && jumlah !== '-';
        })
        .map((item) => ({
          nama: getNamaBarangPengadaan(item.id_barang),
          jumlah: getJumlahBarangPengadaan(item.id_barang) || 1,
          harga: item.harga_perbandingan_harga,
        })),
    };

    try {
      // Get existing invoices
      const suratPO = await AsyncStorage.getItem('PurchaseOrderList');
      const purchaseOrders = suratPO ? JSON.parse(suratPO) : [];
      // Add new invoice to the beginning
      const newPurchaseOrders = [invoice, ...purchaseOrders];
      await AsyncStorage.setItem(
        'PurchaseOrderList',
        JSON.stringify(newPurchaseOrders)
      );
    } catch (e) {
      console.error('Gagal menyimpan Purchase Order:', e);
    }
    resetForm();
    router.push('/list_purchase_order');

    const format = (v) => (Number(v) || 0).toFixed(2);

    // Generate HTML string for the invoice
    const html = `
      <html>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 24px;
        }
        h1 {
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        th {
          background-color: #f4f4f4;
        } 
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }

      </style>
      <head>
        <img src="https://pixvid.org/images/2025/07/14/0mHnI.png" alt="Logo UJS" style="float:left;width: 100px;height: 100px;">
        <p>   Jl. Contoh No.1, Kota, Provinsi 00000</p>
        <p>   Telp : +62 000-0000-0000</p>
        <u>   Kota</u>
        </head>
        <body>
          <h1 align="center">Purchase Order</h1>
          <p>Nomor: ${invoice.number}/PO/VII-UJS/2025</p>
          <p>Tanggal: ${invoice.date}</p>
          <p>Kepada: ${invoice.supplier}</p> 
          <p>Kontak: ${invoice.kontak}</p>
          <p align="right">PAYMENT : CREDIT</p>
          <table border="1" style="width:100%;border-collapse:collapse;">
            <tr>
              <th>Nama Barang</th>
              <th>Jumlah</th>
              <th>Harga</th>
              <th>Total</th>
            </tr>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td>${item.nama}</td>
                <td>${item.jumlah}</td>
                <td align="right">Rp ${format(item.harga)}</td>
                <td align="right">Rp ${format(item.jumlah * item.harga)}</td>
              </tr>
            `
              )
              .join('')}
              <tr>
                <th></th>
                <th></th>
                <th align="left">Sub-total</th>
                <th align="right">Rp ${invoice.items
                  .reduce((sum, i) => sum + i.jumlah * i.harga, 0)
                  .toFixed(2)}</th>
              </tr>
              <tr>
                <th></th>
                <th></th>
                <th align="left">PPN 10%</th>
                <th align="right">Rp ${(
                  invoice.items.reduce(
                    (sum, i) => sum + i.jumlah * i.harga,
                    0
                  ) * 0.1
                ).toFixed(2)}</th>
              </tr>
              <tr>
                <th></th>
                <th></th>
                <th align="left">PPh</th>
                <th align="right">Rp ${(0).toFixed(2)}</th>
              </tr>
              <tr>
                <th></th>
                <th></th>
                <th align="left">Grand Total</th>
                <th align="right">Rp ${(
                  invoice.items.reduce(
                    (sum, i) => sum + i.jumlah * i.harga,
                    0
                  ) * 1.1
                ).toFixed(2)}</th>
              </tr>
          </table>
          <div style="margin-top: 20px; line-height: 6.2; font-size: 10px;">
          <p>Dibuat Oleh: </p>
          <p>Purchaser</p>
          </div>
        </body>
      </html>
    `;

    const file = await Print.printToFileAsync({
      html: html,
      width: 595, // A4 width in points
      height: 842, // A4 height in points
      base64: false,
    });
    await Sharing.shareAsync(file.uri);
  };

  //     const html = generateInvoiceHtml(invoice);

  //     const { uri } = await Print.printToFileAsync({
  //       html,
  //       width: 595, // A4 width in points
  //       height: 842, // A4 height in points
  //     });
  //     await Sharing.shareAsync(uri);
  //   };

  // const handleInvoice = async () => {
  //   const payload = {
  //     company: {
  //       logo: "", // Optional. SVG logo of your company.
  //       name: namaSupplier,
  //       address: "",
  //       phone: kontakSupplier,
  //       email: "",
  //       website: "",
  //       taxId: "", // Optional.
  //       bank: "", // Optional.
  //     },
  //     customer: {
  //       name: namaPengadaan,
  //       company: "", // Optional.
  //       address: "",
  //       phone: "",
  //       email: "",
  //       taxId: "", // Optional.
  //     },
  //     invoice: {
  //       number: idPengadaan, // String or number.
  //       date: "", // Default is current date.
  //       dueDate: "", // Default is current date.
  //       status: "Proses Pembayaran", // Default is "Unpaid".
  //       locale: "id", // BCP 47 language tag. Default is "en-US".
  //       currency: "IDR", // ISO 4217 currency code. Default is "USD".
  //       path: "../invoice.pdf", // Required. Path where you would like to generate the PDF file.
  //     },
  //     items: perbandinganHargaItems.map((item) => ({
  //       name: item.nama_perbandingan_harga,
  //       quantity: item.jumlah_barang, // Number or string.
  //       price: item.harga_perbandingan_harga,
  //       tax: 10, // Specify tax in percentage. Default is 0.
  //     })),
  //     note: {
  //       text: "Invoice dibuat otomatis oleh sistem. Jika ada pertanyaan maupun kesalahan, silakan hubungi admin.",
  //       italic: true, // Default is true.
  //     },
  //   };

  //   /**
  //    * Create the invoice.
  //    */
  //   const invoice = new PDFInvoice(payload);
  //   const pdf = await invoice.create(); // Returns promise, await it.

  //   console.log(pdf); // Full path to the PDF file.
  // };

  const handleSupplierOpenDropdowns = async () => {
    try {
      const barangSupplierValue = await AsyncStorage.getItem(
        'BarangSupplierList'
      );
      const supplierListValue = await AsyncStorage.getItem('SupplierList');
      const barangSupplierList =
        barangSupplierValue != null ? JSON.parse(barangSupplierValue) : [];
      const supplierList =
        supplierListValue != null ? JSON.parse(supplierListValue) : [];

      // Filter by id_barang
      const filtered = barangSupplierList.filter(
        (item) => item.id_barang === idBarang
      );

      // Map to dropdown options with harga and nama_supplier
      const options = filtered.map((item) => {
        const supplier = supplierList.find(
          (s) => s.id_supplier === item.id_supplier
        );
        return {
          ...item,
          nama_supplier: supplier ? supplier.nama_supplier : 'Unknown Supplier',
          display: `${supplier ? supplier.nama_supplier : 'Unknown'} - Rp${
            item.harga
          }`,
        };
      });
      setSupplierOptions(options);
      setOpenSupplier(true);
    } catch (e) {
      console.log(e);
    }
  };

  const getNamaPengadaan = (option) => {
    setNamaPengadaan(option.nama_pengadaan);
  };

  const getKontakSupplier = (option) => {
    setKontakSupplier(option.no_telepon);
  };

  const getNamaSupplier = (option) => {
    setNamaSupplier(option.nama_supplier);
  };

  // const backButton = () => {
  //   setIdPengadaan('');
  //   setIdSupplier('');
  //   setIdBarang('');
  //   setNamaSupplier('');
  //   setNamaPerbandinganHarga('');
  //   setHargaPerbandinganHarga('');
  //   router.push(`/perbandingan-harga`);
  // };

  const generatePDF = async () => {
    try {
      const options = {
        html: `
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
          <h2>Perbandingan Harga List</h2>
          <p>ID Pengadaan: ${idPengadaan}</p>
          <p>ID Supplier: ${idSupplier}</p>
          <table>
            <thead>
              <tr>
                <th>ID Perbandingan</th>
                <th>Nama Barang</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              ${perbandinganHargaItems
                .map(
                  (item) => `
                    <tr>
                      <td>${item.id_perbandingan_harga}</td>
                      <td>${item.nama_perbandingan_harga}</td>
                      <td>${item.harga_perbandingan_harga}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
        `,
        fileName: `perbandinganhargalist_${idPengadaan}_${idSupplier}`,
        directory: 'Download',
      };

      const file = await RNHTMLtoPDF.convert(options);

      // Share the PDF
      await Sharing.shareAsync(file.filePath);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Container style={styles.container}>
      <View style={styles.title}>
        <IconButton
          icon="keyboard-backspace"
          iconColor={colorScheme === 'dark' ? 'white' : 'black'}
          size={32}
          onPress={() => {
            resetForm();
            router.push('/list_purchase_order');
          }}
          style={{ marginRight: 8 }}
        />
        <Text variant="displaySmall" style={styles.titleNameText}>
          Form {'\n'}Purchase Order
        </Text>
      </View>
      <View style={styles.inputContainerText}>
        <Text variant="headlineSmall">Nama Transaksi</Text>
        <TextInput
          placeholder="Masukkan Nama Purchase Order"
          maxLength={30}
          label={'Purchase Order'}
          value={namaPurchaseOrder}
          onChangeText={setNamaPurchaseOrder}
        />
        <Text variant="headlineSmall">Pengadaan</Text>
        <TextInput
          label="Pengadaan"
          value={
            pengadaanOptions.find(
              (item) => item.id_pengadaan === Number(idPengadaan)
            )?.nama_pengadaan || ''
          }
          placeholder="Pilih Pengadaan"
          right={
            <TextInput.Icon
              icon="menu-down"
              onPress={handlePengadaanOpenDropdown} // Use the updated function
            />
          }
          editable={false}
        />
        <Modal
          visible={openPengadaan}
          transparent
          animationType="fade"
          onRequestClose={() => setOpenPengadaan(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={() => setOpenPengadaan(false)} // Only close when tapping outside the modal content
          >
            <View
              style={{
                backgroundColor: colorScheme === 'dark' ? '#222' : '#fff', // Strong contrast
                borderRadius: 8,
                width: '80%',
                padding: 10,
                elevation: 10,
                borderWidth: 1,
                borderColor: colorScheme === 'dark' ? '#888' : '#ccc', // subtle border
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }}
              onStartShouldSetResponder={() => true} // Prevents closing when pressing inside
            >
              {pengadaanOptions.map((option) => (
                <Button
                  key={option.id_pengadaan}
                  onPress={() => {
                    setIdPengadaan(option.id_pengadaan.toString());
                    getNamaPengadaan(option);
                    setOpenPengadaan(false);
                  }}
                  style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                  }}
                  contentStyle={{ justifyContent: 'flex-start' }}
                  labelStyle={{ color: theme.text, textAlign: 'left' }}
                >
                  {option.nama_pengadaan}
                </Button>
              ))}
              <Button onPress={() => setOpenPengadaan(false)}>Tutup</Button>
            </View>
          </TouchableOpacity>
        </Modal>
        <Text variant="headlineSmall">Supplier</Text>
        <TextInput
          label="Supplier"
          value={namaSupplier}
          // value={
          //   idPengadaan
          //     ? supplierOptions.find(
          //         (item) => item.id_pengadaan === Number(idPengadaan)
          //       )?.nama_supplier || ''
          //     : ''
          // }
          placeholder="Pilih Supplier"
          right={
            <TextInput.Icon
              icon="menu-down"
              disabled={!idPengadaan}
              onPress={handleSupplierOpenDropdown} // Use the updated function
            />
          }
          disabled={!idPengadaan}
          editable={false}
        />
        <Modal
          visible={openSupplier}
          transparent
          animationType="fade"
          onRequestClose={() => setOpenSupplier(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={() => setOpenSupplier(false)} // Only close when tapping outside the modal content
          >
            <View
              style={{
                backgroundColor: colorScheme === 'dark' ? '#222' : '#fff', // Strong contrast
                borderRadius: 8,
                width: '80%',
                padding: 10,
                elevation: 10,
                borderWidth: 1,
                borderColor: colorScheme === 'dark' ? '#888' : '#ccc', // subtle border
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }}
              onStartShouldSetResponder={() => true} // Prevents closing when pressing inside
            >
              {supplierOptions.map((option) => (
                <Button
                  key={option.id_supplier}
                  onPress={() => {
                    setIdSupplier(option.id_supplier.toString());
                    getNamaSupplier(option);
                    getKontakSupplier(option);
                    setOpenSupplier(false);
                  }}
                  style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                  }}
                  contentStyle={{ justifyContent: 'flex-start' }}
                  labelStyle={{ color: theme.text, textAlign: 'left' }}
                >
                  {option.nama_supplier}
                </Button>
              ))}
              <Button onPress={() => setOpenSupplier(false)}>Tutup</Button>
            </View>
          </TouchableOpacity>
        </Modal>

        <HelperText type="info" visible={hasError}>
          {errorText}
        </HelperText>
      </View>
      <View style={styles.buttonGroup}>
        <Button
          mode="contained"
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
          buttonColor="#3DA6CC"
          textColor="black"
          onPress={() => {
            if (!hasError && idPengadaan && idSupplier) {
              generatePdfs();
            } else {
              alert('Semua field harus diisi');
            }
          }}
          // onPress={generatePdfs}
        >
          Buat PO
        </Button>
        {/* <Button mode="contained" onPress={generatePDF} style={styles.button}>
          Generate PDF
        </Button> */}
      </View>
    </Container>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.background,
    },
    title: {
      flexDirection: 'row',
    },
    titleNameText: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      justifyContent: 'center',
      flex: 1,
      color: theme.text,
      marginLeft: 10,
      marginRight: 100,
    },
    inputContainerText: {
      marginBottom: 10,
      padding: 10,
      gap: 6,
      width: '100%',
      marginHorizontal: 'auto',
      pointerEvents: 'auto',
    },
    buttonGroup: {
      marginHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      marginHorizontal: 16,
    },
  });
}
