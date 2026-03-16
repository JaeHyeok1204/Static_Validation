import PageHeader from "@/components/PageHeader";
import { timeEvaluationComponent, timeEvaluationRunnable } from "@/app/data/mockData";

export default function TimePage() {
    return (
        <div>
            <PageHeader
                title="소요시간 평가 및 비교"
                description="각 직전 버전과 현재 버전 간의 검사 소요 시간을 비교하여 딜레이 또는 여유 시간을 판정합니다."
            />

            <div className="space-y-8">
                {/* Component Section */}
                <section className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full inline-block"></span>
                        Component 검사 소요시간 판정
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm">
                                    <th className="border p-3">서브시스템명</th>
                                    <th className="border p-3">담당자</th>
                                    <th className="border p-3 text-center">직전버전 소요시간</th>
                                    <th className="border p-3 text-center bg-blue-50 font-bold text-blue-800">해당버전 소요시간</th>
                                    <th className="border p-3 text-center w-40">증감 비교</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeEvaluationComponent.map((item, idx) => (
                                    <tr key={idx} className="text-sm text-gray-700">
                                        <td className="border p-3 font-medium">{item.subsystem}</td>
                                        <td className="border p-3">{item.owner}</td>
                                        <td className="border p-3 text-center text-gray-500">{item.prevTime}</td>
                                        <td className="border p-3 text-center font-bold text-gray-800">{item.currentTime}</td>
                                        <td className={`border p-3 text-center font-bold ${item.diffColor}`}>
                                            {item.diff}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Runnable Section */}
                <section className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
                        Runnable 검사 소요시간 판정
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm">
                                    <th className="border p-3">서브시스템명</th>
                                    <th className="border p-3">담당자</th>
                                    <th className="border p-3 text-center">직전버전 소요시간</th>
                                    <th className="border p-3 text-center bg-blue-50 font-bold text-blue-800">해당버전 소요시간</th>
                                    <th className="border p-3 text-center w-40">증감 비교</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeEvaluationRunnable.map((item, idx) => (
                                    <tr key={idx} className="text-sm text-gray-700">
                                        <td className="border p-3 font-medium">{item.subsystem}</td>
                                        <td className="border p-3">{item.owner}</td>
                                        <td className="border p-3 text-center text-gray-500">{item.prevTime}</td>
                                        <td className="border p-3 text-center font-bold text-gray-800">{item.currentTime}</td>
                                        <td className={`border p-3 text-center font-bold ${item.diffColor}`}>
                                            {item.diff}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}