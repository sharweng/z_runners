import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Dimensions, View } from "react-native";
import Swiper from "react-native-swiper";
import { colors, radius, shadow } from "./theme";

var { width } = Dimensions.get("window");

const Banner = () => {
  const [bannerData, setBannerData] = useState([]);

  useEffect(() => {
    setBannerData([
      "https://images.vexels.com/media/users/3/126443/preview2/ff9af1e1edfa2c4a46c43b0c2040ce52-macbook-pro-touch-bar-banner.jpg",
      "https://pbs.twimg.com/media/D7P_yLdX4AAvJWO.jpg",
      "https://www.yardproduct.com/blog/wp-content/uploads/2016/01/gardening-banner.jpg",
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
    borderRadius: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
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