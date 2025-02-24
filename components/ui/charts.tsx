import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const monthlyPatients = [
  { name: "Jan", patients: 4000 },
  { name: "Feb", patients: 4200 },
  { name: "Mar", patients: 4500 },
  { name: "Apr", patients: 4800 },
  { name: "May", patients: 5000 },
  { name: "Jun", patients: 5200 },
]

const departmentData = [
  { name: "Cardiology", value: 30 },
  { name: "Neurology", value: 25 },
  { name: "Oncology", value: 20 },
  { name: "Pediatrics", value: 15 },
  { name: "Orthopedics", value: 10 },
]

export function MonthlyPatientsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={monthlyPatients}>
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Line type="monotone" dataKey="patients" stroke="#0d9488" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DepartmentDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={departmentData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#0d9488"
          label
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
