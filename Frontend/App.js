if (!global.setImmediate) {
  global.setImmediate = setTimeout;
}
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native'
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import store from './Redux/store';
import Toast from 'react-native-toast-message';
import Auth from './Context/Store/Auth';
import DrawerNavigator from './Navigators/DrawerNavigator';
import { colors } from './Shared/theme';

export default function App() {
  return (
    <Auth>
      <Provider store={store}>
        <NavigationContainer>
          <PaperProvider>
            <StatusBar style="dark" backgroundColor={colors.background} />
            <DrawerNavigator />
          </PaperProvider>
        </NavigationContainer>
        <Toast />
      </Provider>
    </Auth>

  );
}
