import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function AuthLegalFooter({ styles, navigation }) {
  return (
    <View style={styles.legalRow}>
      <TouchableOpacity onPress={() => navigation.navigate("Contact")}>
        <Text style={styles.footerLink}>צור קשר</Text>
      </TouchableOpacity>
      <Text style={styles.footerDot}>·</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Privacy")}>
        <Text style={styles.footerLink}>פרטיות ותנאים</Text>
      </TouchableOpacity>
    </View>
  );
}
