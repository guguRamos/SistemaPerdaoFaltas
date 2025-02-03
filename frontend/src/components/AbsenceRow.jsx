const AbsenceRow = ({ absence, userRole, handleAbsenceChange }) => (
    <tr className="border-b hover:bg-gray-100">
      <td className="border p-3">{absence.student_username}</td>
      <td className="border p-3">
        {userRole === "admin" || userRole === "professor" ? (
          <textarea
            className="border p-1 w-full"
            defaultValue={absence.reason || "Motivo não informado"}
            onBlur={(e) => handleAbsenceChange(absence, { reason: e.target.value })}
          />
        ) : (
          absence.reason || "—"
        )}
      </td>
      <td className="border p-3">{absence.discipline}</td>
      <td className="border p-3">{absence.date}</td>
      <td>
        {userRole === "admin" || userRole === "professor" ? (
          <input
            type="checkbox"
            checked={absence.is_absent || false}
            onChange={(e) => handleAbsenceChange(absence, { is_absent: e.target.checked })}
            className="w-6 h-6 cursor-pointer accent-blue-500"
          />
        ) : (
          absence.is_absent ? "Falta Marcada" : "Presente"
        )}
      </td>
    </tr>
  );
  