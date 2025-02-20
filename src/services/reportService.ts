// sistema-chamadas-react/src/services/reportService.ts

import apiClient from "./apiClient";

export const getAttendanceReport = async (
  token: string,
  professionalId: number,
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
) => {
  try {
    const response = await apiClient.get(
      `/api/reports/attendances/${professionalId}/${startDate}/${startTime}/${endDate}/${endTime}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao gerar relatório");
  }
};