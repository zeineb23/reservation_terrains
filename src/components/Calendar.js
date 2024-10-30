import React from 'react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import db from '../configFirebase';

const Calendar = () => {
  const [reservations, setReservations] = useState([]); 

  // Function to get reservations from Firestore
  const getReservations = async () => {
    const querySnapshot = await getDocs(collection(db, "reservations"));
    const reservationsArray = [];
    querySnapshot.forEach((doc) => {
      reservationsArray.push({ id: doc.id, ...doc.data() });
    });
    console.log(reservationsArray);
    setReservations(reservationsArray); 
  };

  useEffect(() => {
    getReservations();
  }, []);

  return (
    <div>
      <h2>Reservations</h2>
      <table className='tab'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Hour</th>
            <th>Court</th>
            <th>Name</th>
            <th>Last Name</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => {
            const reservationDate = reservation.date.toDate(); 
            const formattedDate = reservationDate.toLocaleDateString(); 
            const formattedTime = reservationDate.toLocaleTimeString(); 

            return (
              <tr key={reservation.id}>
                <td>{reservation.id}</td>
                <td>{formattedDate}</td> 
                <td>{formattedTime}</td> 
                <td>{reservation.num_terrain}</td>
                <td>{reservation.user_name}</td>
                <td>{reservation.user_lastname}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;
