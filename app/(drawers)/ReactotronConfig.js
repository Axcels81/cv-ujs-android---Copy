import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron, {
  asyncStorage,
  networking,
  openInEditor,
  trackGlobalErrors,
} from 'reactotron-react-native';

Reactotron.setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
  .configure() // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .use(networking())
  .use(openInEditor())
  .use(trackGlobalErrors())
  .use(asyncStorage())
  .connect(); // let's connect!

// ...existing code...
export default () => null;
