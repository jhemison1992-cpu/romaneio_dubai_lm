import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowLeft, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: inspections } = trpc.inspections.list.useQuery();
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalInspections: 0,
    completedInspections: 0,
    pendingInspections: 0,
    inProgressInspections: 0,
  });

  useEffect(() => {
    if (projects && inspections) {
      const completed = inspections.filter((i: any) => i.status === "Concluída").length;
      const pending = inspections.filter((i: any) => i.status === "Rascunho").length;
      const inProgress = inspections.filter((i: any) => i.status === "Em Andamento").length;

      setStats({
        totalProjects: projects.length,
        totalInspections: inspections.length,
        completedInspections: completed,
        pendingInspections: pending,
        inProgressInspections: inProgress,
      });
    }
  }, [projects, inspections]);

  const statusData = [
    { name: "Concluída", value: stats.completedInspections, color: "#10b981" },
    { name: "Em Andamento", value: stats.inProgressInspections, color: "#f59e0b" },
    { name: "Rascunho", value: stats.pendingInspections, color: "#6b7280" },
  ];

  const projectData = projects?.map((p: any) => ({
    name: p.title.substring(0, 15),
    inspections: inspections?.filter((i: any) => i.projectId === p.id).length || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/inspection/1">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Dashboard de Analytics</h1>
            <p className="text-muted-foreground mt-2">Acompanhe o progresso de suas obras e vistórias</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Obras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Obras cadastradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Vistórias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInspections}</div>
              <p className="text-xs text-muted-foreground mt-1">Vistórias criadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedInspections}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalInspections > 0 ? Math.round((stats.completedInspections / stats.totalInspections) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.inProgressInspections}</div>
              <p className="text-xs text-muted-foreground mt-1">Vistórias ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                Rascunhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.pendingInspections}</div>
              <p className="text-xs text-muted-foreground mt-1">Não iniciadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Status</CardTitle>
              <CardDescription>Vistórias por status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projects Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Vistórias por Obra</CardTitle>
              <CardDescription>Distribuição de vistórias entre as obras</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inspections" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inspections */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Vistórias Recentes</CardTitle>
            <CardDescription>Últimas vistórias criadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inspections?.slice(0, 5).map((inspection: any) => (
                <div key={inspection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{inspection.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(inspection.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      inspection.status === "Concluída" ? "bg-green-100 text-green-800" :
                      inspection.status === "Em Andamento" ? "bg-amber-100 text-amber-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {inspection.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
