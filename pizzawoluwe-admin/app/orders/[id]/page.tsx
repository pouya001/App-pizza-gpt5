useEffect(() => {
    loadSlots();
  }, [selectedDate]);

  // Nouveau useEffect pour sélectionner le créneau après chargement
  useEffect(() => {
    if (slots.length > 0 && order.scheduled_at && !selectedSlot) {
      const orderTime = new Date(order.scheduled_at);
      const matchingSlot = slots.find((slot: Slot) => {
        const slotTime = new Date(slot.starts_at);
        return slotTime.getTime() === orderTime.getTime();
      });
      
      if (matchingSlot) {
        setSelectedSlot(matchingSlot.id);
      }
    }
  }, [slots, order.scheduled_at, selectedSlot]);
