type PopularityInput = {
  rating: number;
  reviewsCount: number;
  viewCount: number;
  clickCount: number;
};

export function getPlacePopularityScore(place: PopularityInput) {
  return (
    place.rating * 12 +
    place.reviewsCount * 8 +
    place.viewCount * 0.35 +
    place.clickCount * 1.5
  );
}

export function isPlacePopular(place: PopularityInput) {
  return getPlacePopularityScore(place) >= 24;
}
