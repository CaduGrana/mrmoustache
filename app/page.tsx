"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Scissors, CalendarIcon, Settings, User, Phone, Mail, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Agendamento {
  id: string
  nomeCompleto: string
  telefone: string
  email: string
  barbeiro: string
  data: string
  horario: string
  observacoes?: string
  status: "agendado" | "concluido" | "cancelado"
}

interface Barbeiro {
  id: string
  nome: string
  especialidade: string
  disponivel: boolean
}

const barbeiros: Barbeiro[] = [
  { id: "1", nome: "João Silva", especialidade: "Corte Clássico", disponivel: true },
  { id: "2", nome: "Pedro Santos", especialidade: "Barba e Bigode", disponivel: true },
  { id: "3", nome: "Carlos Oliveira", especialidade: "Corte Moderno", disponivel: true },
  { id: "4", nome: "Rafael Costa", especialidade: "Degradê", disponivel: false },
]

const horarios = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
]

export default function BarbeariaSystem() {
  const [activeTab, setActiveTab] = useState("agendar")
  const [visitCount, setVisitCount] = useState(1247)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    telefone: "",
    email: "",
    barbeiro: "",
    data: "",
    horario: "",
    observacoes: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (
      !formData.nomeCompleto ||
      !formData.telefone ||
      !formData.email ||
      !formData.barbeiro ||
      !formData.data ||
      !formData.horario
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const novoAgendamento: Agendamento = {
      id: Date.now().toString(),
      ...formData,
      status: "agendado",
    }

    setAgendamentos((prev) => [...prev, novoAgendamento])
    setVisitCount((prev) => prev + 1)

    toast({
      title: "Agendamento realizado!",
      description: `Horário agendado para ${formData.data} às ${formData.horario}`,
    })

    // Reset form
    setFormData({
      nomeCompleto: "",
      telefone: "",
      email: "",
      barbeiro: "",
      data: "",
      horario: "",
      observacoes: "",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800"
      case "concluido":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const updateStatus = (id: string, newStatus: "agendado" | "concluido" | "cancelado") => {
    setAgendamentos((prev) =>
      prev.map((agendamento) => (agendamento.id === id ? { ...agendamento, status: newStatus } : agendamento)),
    )
    toast({
      title: "Status atualizado",
      description: `Agendamento marcado como ${newStatus}`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Scissors className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-wide">BARBEARIA CORTE NOBRE</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-b-0">
              <TabsTrigger
                value="agendar"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                <User className="h-4 w-4 mr-2" />
                Agendar Horário
              </TabsTrigger>
              <TabsTrigger
                value="calendario"
                className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:border-green-600"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendário
              </TabsTrigger>
              <TabsTrigger
                value="gerenciar"
                className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700 data-[state=active]:border-b-2 data-[state=active]:border-teal-600"
              >
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar
              </TabsTrigger>
            </TabsList>

            {/* Agendar Horário */}
            <TabsContent value="agendar" className="mt-8">
              <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Scissors className="h-6 w-6 text-blue-600" />
                      <CardTitle className="text-2xl text-blue-800">Agendar um Horário</CardTitle>
                    </div>
                    <CardDescription className="text-gray-600">
                      Preencha os dados abaixo para agendar seu horário
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Nome Completo */}
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="flex items-center gap-2 text-gray-700">
                          <User className="h-4 w-4" />
                          Nome Completo *
                        </Label>
                        <Input
                          id="nome"
                          placeholder="Seu nome completo"
                          value={formData.nomeCompleto}
                          onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Telefone */}
                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-4 w-4" />
                          Telefone de Contato *
                        </Label>
                        <Input
                          id="telefone"
                          placeholder="(11) 99999-9999"
                          value={formData.telefone}
                          onChange={(e) => handleInputChange("telefone", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* E-mail */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                          <Mail className="h-4 w-4" />
                          E-mail *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Barbeiro */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-gray-700">
                          <Scissors className="h-4 w-4" />
                          Nome do Barbeiro *
                        </Label>
                        <Select
                          value={formData.barbeiro}
                          onValueChange={(value) => handleInputChange("barbeiro", value)}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecione um barbeiro" />
                          </SelectTrigger>
                          <SelectContent>
                            {barbeiros.map((barbeiro) => (
                              <SelectItem key={barbeiro.id} value={barbeiro.nome} disabled={!barbeiro.disponivel}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{barbeiro.nome}</span>
                                  <span className="text-xs text-gray-500 ml-2">{barbeiro.especialidade}</span>
                                  {!barbeiro.disponivel && (
                                    <Badge variant="secondary" className="ml-2">
                                      Indisponível
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Data */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-gray-700">
                          <CalendarIcon className="h-4 w-4" />
                          Data *
                        </Label>
                        <Input
                          type="date"
                          value={formData.data}
                          onChange={(e) => handleInputChange("data", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>

                      {/* Horário */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-4 w-4" />
                          Horário *
                        </Label>
                        <Select value={formData.horario} onValueChange={(value) => handleInputChange("horario", value)}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecione um barbeiro e data primeiro" />
                          </SelectTrigger>
                          <SelectContent>
                            {horarios.map((horario) => (
                              <SelectItem key={horario} value={horario}>
                                {horario}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Observações */}
                      <div className="space-y-2">
                        <Label htmlFor="observacoes" className="text-gray-700">
                          Observações (opcional)
                        </Label>
                        <Textarea
                          id="observacoes"
                          placeholder="Alguma observação sobre o corte ou serviço?"
                          value={formData.observacoes}
                          onChange={(e) => handleInputChange("observacoes", e.target.value)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 text-lg font-semibold"
                      >
                        Agendar Agora
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Visit Counter */}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Visitas na página: <span className="font-bold text-blue-600">{visitCount}</span>
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Calendário */}
            <TabsContent value="calendario" className="mt-8">
              <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CalendarIcon className="h-6 w-6" />
                      Calendário de Agendamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border border-gray-200"
                        />
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-800">
                          Agendamentos {selectedDate ? `para ${selectedDate.toLocaleDateString("pt-BR")}` : "do dia"}
                        </h3>
                        {agendamentos.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">Nenhum agendamento encontrado</p>
                        ) : (
                          <div className="space-y-3">
                            {agendamentos.map((agendamento) => (
                              <div key={agendamento.id} className="p-4 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-gray-800">{agendamento.nomeCompleto}</h4>
                                  <Badge className={getStatusColor(agendamento.status)}>{agendamento.status}</Badge>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>
                                    <strong>Barbeiro:</strong> {agendamento.barbeiro}
                                  </p>
                                  <p>
                                    <strong>Data:</strong> {agendamento.data}
                                  </p>
                                  <p>
                                    <strong>Horário:</strong> {agendamento.horario}
                                  </p>
                                  <p>
                                    <strong>Telefone:</strong> {agendamento.telefone}
                                  </p>
                                  {agendamento.observacoes && (
                                    <p>
                                      <strong>Observações:</strong> {agendamento.observacoes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Gerenciar */}
            <TabsContent value="gerenciar" className="mt-8">
              <div className="max-w-6xl mx-auto">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-teal-800">
                      <Settings className="h-6 w-6" />
                      Gerenciar Agendamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {agendamentos.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Nenhum agendamento para gerenciar</p>
                    ) : (
                      <div className="space-y-4">
                        {agendamentos.map((agendamento) => (
                          <div
                            key={agendamento.id}
                            className="p-6 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-semibold text-lg text-gray-800">{agendamento.nomeCompleto}</h4>
                                <p className="text-gray-600">{agendamento.email}</p>
                              </div>
                              <Badge className={getStatusColor(agendamento.status)}>{agendamento.status}</Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2 text-sm">
                                <p>
                                  <strong>Barbeiro:</strong> {agendamento.barbeiro}
                                </p>
                                <p>
                                  <strong>Data:</strong> {agendamento.data}
                                </p>
                                <p>
                                  <strong>Horário:</strong> {agendamento.horario}
                                </p>
                              </div>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <strong>Telefone:</strong> {agendamento.telefone}
                                </p>
                                {agendamento.observacoes && (
                                  <p>
                                    <strong>Observações:</strong> {agendamento.observacoes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(agendamento.id, "agendado")}
                                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                Agendado
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(agendamento.id, "concluido")}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                              >
                                Concluído
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(agendamento.id, "cancelado")}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Cancelado
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
