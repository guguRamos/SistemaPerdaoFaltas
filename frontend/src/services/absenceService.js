import axios from "axios";
import { ACCESS_TOKEN } from "../constants";

export const updateAbsence = async (absenceId, isAbsent, discipline, reason) => {
  const response = await axios.put(
    `/api/absences/update`,
    {
      user_id: userId,
      discipline: discipline || "Disciplina não informada",
      is_absent: isAbsent,
      reason: reason || "Motivo não informado",
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
      },
    }
  );
  console.log("Response from API:", response.data);
  return response.data;
};
