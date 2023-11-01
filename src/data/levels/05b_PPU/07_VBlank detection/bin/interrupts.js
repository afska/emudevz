/** CPU interrupts. */
export default {
  // Non-maskable interrupt (used to detect vertical blanking)
  NMI: {
    id: "NMI",
    vector: 0xfffa
  },

  // Reset (called when the system is powered on)
  RESET: {
    id: "RESET",
    vector: 0xfffc
  },

  // Interrupt request (runs a user interrupt handler)
  IRQ: {
    id: "IRQ",
    vector: 0xfffe
  }
};
