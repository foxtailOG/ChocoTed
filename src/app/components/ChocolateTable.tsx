import { ChocolateConsumerData } from "../../data/chocolateData";

export default function ChocolateTable({ data }: { data: ChocolateConsumerData[] }) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2">Age</th>
            <th className="p-2">Gender</th>
            <th className="p-2">Region</th>
            <th className="p-2">Brand</th>
            <th className="p-2">Spend (₹)</th>
            <th className="p-2">Satisfaction</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{row.age}</td>
              <td className="p-2">{row.gender}</td>
              <td className="p-2">{row.region}</td>
              <td className="p-2">{row.brand_preference}</td>
              <td className="p-2">{row.average_spend_inr}</td>
              <td className="p-2">{row.satisfaction_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
