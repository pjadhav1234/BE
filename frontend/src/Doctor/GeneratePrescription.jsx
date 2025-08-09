// Form for doctor to add diagnosis, medicine, etc., and submit.

// import React, { useState } from 'react';
// import { createPrescription } from '../../services/api';

// const GeneratePrescription = () => {
//   const [form, setForm] = useState({ patientId: '', medicines: '', notes: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await createPrescription(form);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="p-6">
//       <input placeholder="Patient ID" onChange={(e) => setForm({ ...form, patientId: e.target.value })} />
//       <input placeholder="Medicines (comma-separated)" onChange={(e) => setForm({ ...form, medicines: e.target.value })} />
//       <textarea placeholder="Notes" onChange={(e) => setForm({ ...form, notes: e.target.value })} />
//       <button type="submit">Generate</button>
//     </form>
//   );
// };

// export default GeneratePrescription;