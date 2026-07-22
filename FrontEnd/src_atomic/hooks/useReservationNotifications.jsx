import { useEffect, useState, useRef } from "react";

export const useReservationNotifications = () => {
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const lastKnownId = useRef(null);

  // Reproducir voz sintética
  const playVoiceAlert = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance("¡Atención! Tienes una nueva reserva pendiente.");
      msg.lang = "es-ES";
      msg.rate = 1.0;
      msg.pitch = 1.2;
      msg.volume = 1.0;
      window.speechSynthesis.speak(msg);
    }
  };

  const checkForNewReservations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/latest-id`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "ngrok-skip-browser-warning": "true"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const latestId = data.latest_id;

        // Si es la primera vez que consultamos, solo guardamos el ID inicial
        if (lastKnownId.current === null) {
          lastKnownId.current = latestId;
          return;
        }

        // Si hay un ID mayor al que conocíamos, significa que hay nueva reserva
        if (latestId > lastKnownId.current) {
          lastKnownId.current = latestId;
          setHasNewNotification(true);
          playVoiceAlert();
        }
      }
    } catch (error) {
      console.error("Error consultando nuevas reservas:", error);
    }
  };

  useEffect(() => {
    // Consultar inmediatamente
    checkForNewReservations();

    // Luego consultar cada 15 segundos
    const interval = setInterval(() => {
      checkForNewReservations();
    }, 15000);

    const handleForceCheck = () => checkForNewReservations();
    window.addEventListener('forceNotificationCheck', handleForceCheck);

    return () => {
      clearInterval(interval);
      window.removeEventListener('forceNotificationCheck', handleForceCheck);
    };
  }, []);

  return { hasNewNotification, setHasNewNotification };
};
