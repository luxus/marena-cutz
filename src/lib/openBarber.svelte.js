// Shared Svelte 5 runes state for accordion behavior in the price list.
// Imported by each BarberPrice.svelte instance; module scope ensures single source of truth.
// Mutate .current (a $state proxy) to coordinate which barber section is open.
export const openBarber = $state({ current: '' });
