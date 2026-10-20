import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

function PDFApp() {
  const [count, setCount] = useState(1);

  const orderLines = [
    { id: 1, product: 'Product 1', quantity: 1, price: '$10.00' },
    { id: 2, product: 'Product 2', quantity: 2, price: '$20.00' },
    { id: 3, product: 'Product 3', quantity: 3, price: '$30.00' },
  ];

  const htmls = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica'; font-size: 12px; }
              header, footer { height: 50px; background-color: #fff; color: #000; display: flex; justify-content: center; padding: 0 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 5px; }
              th { background-color: #ccc; }
            </style>
          </head>
          <body>
            <header>
              <h1>Invoice for Order #${count}</h1>
            </header>
            <h1>Order Details</h1>
            <table>
              <tr><th>Order ID</th><td>${count}</td></tr>
              <tr><th>Order Date</th><td>29-Jul-2022</td></tr>
              <tr><th>Order Status</th><td>Completed</td></tr>
              <tr><th>Order Total</th><td>$13232</td></tr>
            </table>
            <h1>Order Lines</h1>
            <table>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Product Qty</th>
                <th>Product Price</th>
              </tr>
              ${orderLines
                .map(
                  (line) => `
                <tr>
                  <td>${line.id}</td>
                  <td>${line.product}</td>
                  <td>${line.quantity}</td>
                  <td>${line.price}</td>
                </tr>
              `
                )
                .join('')}
            </table>
            <footer>
              <p>Thank you for your business!</p>
            </footer>
          </body>
        </html>
      `;

  const generatePDFS = async () => {
    try {
      console.log('Generating PDF...');
      const result = await Print.printToFileAsync({
        html: htmls,
        base64: false,
        width: 595, // A4 width in points
        height: 842, // A4 height in points
      });
      console.log('Print result:', result);

      if (!result || !result.uri) {
        throw new Error('Failed to generate PDF file');
      }

      await Sharing.shareAsync(result.uri);
      setCount(count + 1);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', error.message || 'Failed to generate PDF');
    }
  };

  const generatePDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica'; font-size: 12px; }
              header, footer { height: 50px; background-color: #fff; color: #000; display: flex; justify-content: center; padding: 0 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 5px; }
              th { background-color: #ccc; }
            </style>
          </head>
          <body>
            <header>
              <h1>Invoice for Order #${count}</h1>
            </header>
            <h1>Order Details</h1>
            <table>
              <tr><th>Order ID</th><td>${count}</td></tr>
              <tr><th>Order Date</th><td>29-Jul-2022</td></tr>
              <tr><th>Order Status</th><td>Completed</td></tr>
              <tr><th>Order Total</th><td>$13232</td></tr>
            </table>
            <h1>Order Lines</h1>
            <table>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Product Qty</th>
                <th>Product Price</th>
              </tr>
              ${orderLines
                .map(
                  (line) => `
                <tr>
                  <td>${line.id}</td>
                  <td>${line.product}</td>
                  <td>${line.quantity}</td>
                  <td>${line.price}</td>
                </tr>
              `
                )
                .join('')}
            </table>
            <footer>
              <p>Thank you for your business!</p>
            </footer>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
      setCount(count + 1);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={generatePDF}>
        <Text style={styles.text}>Generate PDF</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={generatePDFS}>
        <Text style={styles.text}>Generate PDFS</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#aac',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    color: '#fff',
  },
  button: {
    backgroundColor: '#6c8ee3',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
});

export default PDFApp;
