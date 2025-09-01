import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZES } from "../constants";

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sobre o Nexo</Text>
      <Text style={styles.subtitle}>Versão 1.0.0</Text>
      <Text style={styles.bodyText}>
        O Nexo é um aplicativo de troca de habilidades, conectando pessoas que
        desejam aprender e ensinar. Acreditamos que todos têm algo a oferecer e
        algo a aprender.
      </Text>
      <Text style={styles.bodyText}>
        Desenvolvido com ❤️ para a comunidade.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: FONT_SIZES.h1,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
    textAlign: "center",
    marginBottom: 20,
  },
  bodyText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
});

export default AboutScreen;
