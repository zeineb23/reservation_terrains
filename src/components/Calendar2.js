import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import db from '../configFirebase';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { getAuth } from 'firebase/auth';

const localizer = momentLocalizer(moment);

const Calendar2 = () => {
  const [reservations, setReservations] = useState([]);
  const [workingHours, setWorkingHours] = useState({
    min: new Date().setHours(14, 0, 0),
    max: new Date().setHours(18, 0, 0),
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    user_name: '',
    user_lastname: '',
    num_terrain: 2,
    start: new Date(),
    end: new Date(),
  });
  const [currentUserInfo, setCurrentUserInfo] = useState({ user_name: '', user_lastname: '' }); // State to store current user's info

  // Function to get working hours based on the day of the week
  const getWorkingHours = (date) => {
    const dayOfWeek = moment(date).day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        min: new Date(date.setHours(8, 0, 0)),
        max: new Date(date.setHours(18, 0, 0)),
      };
    } else {
      return {
        min: new Date(date.setHours(14, 0, 0)),
        max: new Date(date.setHours(18, 0, 0)),
      };
    }
  };

  // Function to handle navigation
  const handleNavigate = (date) => {
    const today = new Date();
    const maxDate = new Date(today.setDate(today.getDate() + 4));

    if (date > maxDate) {
      alert("You can't navigate more than 4 days in the future.");
      return;
    }

    const { min, max } = getWorkingHours(date);
    setWorkingHours({ min, max });
  };

  // Function to get reservations from Firestore based on the current user
  const getReservations = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userQuery = query(collection(db, 'users'), where('uid', '==', currentUser.uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0].data();
        setCurrentUserInfo({
          user_name: userDoc.user_name || '', // Set the current user's first name
          user_lastname: userDoc.user_lastname || '', // Set the current user's last name
        });

        const reservationsQuery = query(collection(db, 'reservations'), where('user_id', '==', currentUser.uid));
        const querySnapshot = await getDocs(reservationsQuery);
        const reservationsArray = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const start = data.date.toDate();
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          if (data.num_terrain === 2) {
            reservationsArray.push({
              id: doc.id,
              title: `${data.user_name} ${data.user_lastname}`,
              start,
              end,
              resourceId: data.num_terrain,
            });
          }
        });
        setReservations(reservationsArray);
      }
    }
  };

  // UseEffect to get reservations and user info when the component mounts
  useEffect(() => {
    getReservations();
  }, []);

  // Function to handle form submission
  const handleAddEvent = async () => {
    const reservationData = {
      user_name: newEvent.user_name || currentUserInfo.user_name,
      user_lastname: newEvent.user_lastname || currentUserInfo.user_lastname,
      num_terrain: 2,
      date: newEvent.start,
      user_id: getAuth().currentUser.uid,
    };

    await addDoc(collection(db, 'reservations'), reservationData);
    setReservations([...reservations, { ...reservationData, start: newEvent.start, end: newEvent.end }]);
    setModalIsOpen(false);
  };

  // Check if the selected slot overlaps with existing reservations
  const isSlotAvailable = (start, end) => {
    return !reservations.some((reservation) => {
      return (
        (start >= reservation.start && start < reservation.end) ||
        (end > reservation.start && end <= reservation.end) ||
        (start <= reservation.start && end >= reservation.end)
      );
    });
  };

  // Function to handle slot selection
  const handleSelectSlot = ({ start, end }) => {
    if (isSlotAvailable(start, end)) {
      setNewEvent({
        ...newEvent,
        user_name: currentUserInfo.user_name,
        user_lastname: currentUserInfo.user_lastname,
        start,
        end,
      });
      setModalIsOpen(true);
    } else {
      alert('This time slot is already reserved. Please select a different time.');
    }
  };

  return (
    <div>
      <h4>Terrain 2</h4>
      <BigCalendar
        localizer={localizer}
        events={reservations}
        defaultView="day"
        views={['day']}
        step={60}
        timeslots={1}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        style={{ height: 500 }}
        min={workingHours.min}
        max={workingHours.max}
        onNavigate={handleNavigate}
        onSelectSlot={handleSelectSlot}
        selectable
      />

      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <h2>Add Reservation</h2>
        </Modal.Header>
        <Modal.Body>
          <label>
            First Name:
            <input
              type="text"
              value={newEvent.user_name}
              onChange={(e) => setNewEvent({ ...newEvent, user_name: e.target.value })}
              disabled // Disable input to make it unchangeable
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              value={newEvent.user_lastname}
              onChange={(e) => setNewEvent({ ...newEvent, user_lastname: e.target.value })}
              disabled // Disable input to make it unchangeable
            />
          </label>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAddEvent}>Add Reservation</Button>
          <Button variant="secondary" onClick={() => setModalIsOpen(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Calendar2;
