import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Dimensions, View } from "react-native";
import Swiper from "react-native-swiper";
import { colors } from "./theme";

var { width } = Dimensions.get("window");

const Banner = () => {
  const [bannerData, setBannerData] = useState([]);

  useEffect(() => {
    setBannerData([
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    ]);

    return () => {
      setBannerData([]);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Swiper
        style={styles.swiperTrack}
        showsPagination={true}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        paginationStyle={styles.pagination}
        showButtons={false}
        autoplay={true}
        autoplayTimeout={2}
      >
        {bannerData.map((item) => {
          return (
            <View key={item} style={styles.slide}>
              <Image
                style={styles.imageBanner}
                resizeMode="cover"
                source={{ uri: item }}
              />
            </View>
          );
        })}
      </Swiper>
      <View style={{ height: 8 }} />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    backgroundColor: colors.background,
  },
  swiperTrack: {
    height: 192,
  },
  slide: {
    width: width,
    paddingHorizontal: 0,
  },
  imageBanner: {
    height: 192,
    width: width,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pagination: {
    bottom: 10,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    width: 7,
    height: 7,
    borderRadius: 7,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 8,
    height: 8,
    borderRadius: 8,
    marginHorizontal: 3,
  },
});

export default Banner;