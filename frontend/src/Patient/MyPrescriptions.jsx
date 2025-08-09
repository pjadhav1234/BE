// View and download AI-generated or doctor-created prescriptions.

// import React, { useEffect, useState } from 'react';
// import { getPrescriptions } from '../../services/api';
// import PrescriptionCard from '../../components/PrescriptionCard';

// const MyPrescriptions = () => {
//   const [prescriptions, setPrescriptions] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await getPrescriptions();
//       setPrescriptions(data);
//     };
//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h2>My Prescriptions</h2>
//       {prescriptions.map(pres => <PrescriptionCard key={pres._id} prescription={pres} />)}
//     </div>
//   );
// };

// export default MyPrescriptions;