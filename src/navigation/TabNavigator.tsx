import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AnalysisScreen } from '../screens/AnalysisScreen';
import { ValvesScreen } from '../screens/ValvesScreen';
import { ConnectionScreen } from '../screens/ConnectionScreen';
import { ConfigScreen } from '../screens/ConfigScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <View style={styles.headerTitleContainer}>
        {/* Usamos MaterialCommunityIcons para el icono de planta con wifi si existe, o combinamos */}
        <MaterialCommunityIcons name="sprout" size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.headerTitle, { color: theme.colors.secondary }]}>GREEN-PULSE</Text>
      </View>
      <View style={styles.headerIconsContainer}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="cloud-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.card, marginLeft: 10 }]} onPress={toggleTheme}>
          <Ionicons name={theme.isDark ? "sunny-outline" : "moon-outline"} size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.tabIconSelected,
          tabBarInactiveTintColor: theme.colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBackground,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: theme.isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'sans-serif',
            marginTop: -4,
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'En Vivo') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Análisis') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            } else if (route.name === 'Válvulas') {
              iconName = focused ? 'options' : 'options-outline';
            } else if (route.name === 'Conexión') {
              iconName = focused ? 'wifi' : 'wifi-outline';
            } else if (route.name === 'Config') {
              iconName = focused ? 'cog' : 'cog-outline';
            }

            return (
              <Ionicons name={iconName} size={24} color={color} />
            );
          },
        })}
      >
        <Tab.Screen name="En Vivo" component={DashboardScreen} />
        <Tab.Screen name="Análisis" component={AnalysisScreen} />
        <Tab.Screen name="Válvulas" component={ValvesScreen} />
        <Tab.Screen name="Conexión" component={ConnectionScreen} />
        <Tab.Screen name="Config" component={ConfigScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;
