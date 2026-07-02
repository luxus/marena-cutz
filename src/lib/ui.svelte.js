// Shared Svelte 5 runes state across client islands.
export const userTheme = $state({
  theme: 'architectural',
  mode: 'dark',
});

export const bookingDrawer = $state({ open: false });
export const parkingDrawer = $state({ open: false });
export const openBarber = $state({ current: '' });