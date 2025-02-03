const AbsenceTable = ({ absences, userRole, handleAbsenceChange }) => (
    <table className="w-full border-collapse border border-gray-300 text-center">
      <thead>
        <tr className="bg-black text-white">
          <th className="border p-3">Aluno</th>
          <th className="border p-3">Comentário</th>
          <th className="border p-3">Disciplina</th>
          <th className="border p-3">Data</th>
          <th className="border p-3">Falta</th>
        </tr>
      </thead>
      <tbody>
        {absences.map((absence) => (
          <AbsenceRow key={absence.id} absence={absence} userRole={userRole} handleAbsenceChange={handleAbsenceChange} />
        ))}
      </tbody>
    </table>
  );
  