import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { Link, useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as React from 'react';
import { Appearance, StyleSheet, View } from 'react-native';

import { Button, DataTable, IconButton } from 'react-native-paper';

export default function ListPurchaseOrder() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  const [page, setPage] = React.useState(0);
  const [numberOfItemsPerPageList] = React.useState([2, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0]
  );

  const [purchaseOrders, setPurchaseOrders] = React.useState([]);
  const [pengadaan, setPengadaan] = React.useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchPurchaseOrders = async () => {
        const data = await AsyncStorage.getItem('PurchaseOrderList');
        setPurchaseOrders(data ? JSON.parse(data) : []);
        const dataPengadaan = await AsyncStorage.getItem('PengadaanList');
        setPengadaan(dataPengadaan ? JSON.parse(dataPengadaan) : []);
      };
      fetchPurchaseOrders();
    }, [])
  );

  const resetPurchaseOrderList = async () => {
    try {
      await AsyncStorage.removeItem('PurchaseOrderList');
      // Optionally, refresh your state here if needed
      alert('Semua List Purchase Order berhasil dihapus!');
    } catch (e) {
      console.error('List Purchase Order gagal dihapus!', e);
    }
  };

  const handleDownloadPDF = async (invoice) => {
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

  const resolveNamaPengadaan = async (invoice) => {
    // direct fields on invoice
    if (invoice.nama_pengadaan || invoice.instansi_pengadaan) {
      return invoice.nama_pengadaan || invoice.instansi_pengadaan;
    }

    // ensure we have the latest pengadaan list
    const list =
      pengadaan && pengadaan.length
        ? pengadaan
        : JSON.parse((await AsyncStorage.getItem('PengadaanList')) || '[]');

    // candidate id values from invoice
    const invoiceIds = [
      invoice.id_pengadaan,
      invoice.pengadaan_id,
      invoice.pengadaanId,
      invoice.id,
      invoice.number,
      invoice.sequence,
    ].filter((v) => v !== undefined && v !== null);

    if (invoiceIds.length === 0 && list.length === 0) {
      return invoice.nama || '-';
    }

    // search list for a matching id (compare as strings)
    for (const p of list) {
      const pIds = [p.id_pengadaan, p.pengadaan_id, p.id, p.pengadaanId].filter(
        (v) => v !== undefined && v !== null
      );
      if (
        pIds.some((pid) =>
          invoiceIds.some((iid) => String(pid) === String(iid))
        )
      ) {
        return p.instansi_pengadaan || p.nama_pengadaan || p.nama || '-';
      }
    }

    // fallback
    return invoice.nama || '-';
  };

  const handleInvoicePDF = async (invoice) => {
    const format = (v) => (Number(v) || 0).toFixed(2);

    const namaPengadaan = await resolveNamaPengadaan(invoice);

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
          <h1 align="center">Invoice</h1>
          <p>Nomor: ${invoice.number}/PO/VII-UJS/2025</p>
          <p>Tanggal: ${invoice.date}</p>
          <b>Informasi Purchaser:</b>
          <p>Nama: ${namaPengadaan}</p> 
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
                <th align="left">Total Tagihan</th>
                <th align="right">Rp ${(
                  invoice.items.reduce(
                    (sum, i) => sum + i.jumlah * i.harga,
                    0
                  ) * 1.1
                ).toFixed(2)}</th>
              </tr>
          </table>
          <div style="margin-top: 20px; line-height: 6.2; font-size: 10px;">
          <b>Catatan:</b>Terima kasih sudah melakukan pembelian terhadap ${
            invoice.supplier
          }
          <div align="left"><p>Supplier</p>
          <p>${invoice.supplier}</p></div>
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

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, purchaseOrders.length);

  React.useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  return (
    <View style={styles.container}>
      <Link href="/purchase_order" asChild>
        <Button
          icon="plus-thick"
          mode="contained"
          buttonColor="white"
          textColor="black"
          style={styles.createButton}
          labelStyle={{ color: 'black' }}
        >
          Buat Purchase Order
        </Button>
      </Link>
      <View style={styles.tableWrapper}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Nama Transaksi</DataTable.Title>
            <DataTable.Title numeric>Action</DataTable.Title>
          </DataTable.Header>

          {purchaseOrders.slice(from, to).map((order, idx) => (
            <DataTable.Row key={`${order.number || ''}-${idx}`}>
              <DataTable.Cell>{order.nama || '-'}</DataTable.Cell>
              <DataTable.Cell numeric>
                <IconButton
                  icon="file-download"
                  size={24}
                  onPress={() => handleDownloadPDF(order)}
                />
                <IconButton
                  icon="file-document"
                  size={24}
                  onPress={() => handleInvoicePDF(order)}
                />
              </DataTable.Cell>
            </DataTable.Row>
          ))}

          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(purchaseOrders.length / itemsPerPage)}
            onPageChange={(page) => setPage(page)}
            label={`${from + 1}-${to} of ${purchaseOrders.length}`}
            numberOfItemsPerPageList={numberOfItemsPerPageList}
            numberOfItemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            showFastPaginationControls
            selectPageDropdownLabel={'Rows per page'}
          />
        </DataTable>
        <Button
          icon="delete"
          mode="contained"
          onPress={resetPurchaseOrderList}
          style={{ marginBottom: 16, backgroundColor: 'red' }}
        >
          Hapus Semua Purchase Order List
        </Button>
      </View>
    </View>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center', // horizontal center
      backgroundColor: '#000', // <-- black background
      padding: 16,
    },
    createButton: {
      alignSelf: 'flex-start', // Align to the left
      marginBottom: 16,
      backgroundColor: '#ffff', // <-- blue button background
    },
    tableWrapper: {
      backgroundColor: '#212936', // <-- black background for table
      borderRadius: 12,
      padding: 16,
      elevation: 4,
      maxWidth: 500,
      width: '100%',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
  });
}
