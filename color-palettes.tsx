"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Palette, Download, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ColorPalette {
  id: string
  name: string
  description: string
  colors: {
    name: string
    hex: string
    rgb: string
    usage: string
  }[]
  category: string
}

const colorPalettes: ColorPalette[] = [
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    description: "Paleta inspirada nas cores do oceano e da natureza",
    category: "Natureza",
    colors: [
      { name: "Deep Ocean", hex: "#0F4C75", rgb: "rgb(15, 76, 117)", usage: "Backgrounds" },
      { name: "Ocean Blue", hex: "#3282B8", rgb: "rgb(50, 130, 184)", usage: "Primary" },
      { name: "Sky Blue", hex: "#BBE1FA", rgb: "rgb(187, 225, 250)", usage: "Accents" },
      { name: "Forest Green", hex: "#0E8388", rgb: "rgb(14, 131, 136)", usage: "Secondary" },
      { name: "Mint Green", hex: "#2E8B57", rgb: "rgb(46, 139, 87)", usage: "Success" },
    ],
  },
  {
    id: "emerald-depths",
    name: "Emerald Depths",
    description: "Tons profundos de verde esmeralda e azul marinho",
    category: "Elegante",
    colors: [
      { name: "Midnight Blue", hex: "#1B263B", rgb: "rgb(27, 38, 59)", usage: "Dark Base" },
      { name: "Navy Blue", hex: "#415A77", rgb: "rgb(65, 90, 119)", usage: "Primary" },
      { name: "Steel Blue", hex: "#778DA9", rgb: "rgb(119, 141, 169)", usage: "Secondary" },
      { name: "Emerald", hex: "#50C878", rgb: "rgb(80, 200, 120)", usage: "Accent" },
      { name: "Jade", hex: "#00A86B", rgb: "rgb(0, 168, 107)", usage: "Success" },
    ],
  },
  {
    id: "tropical-paradise",
    name: "Tropical Paradise",
    description: "Cores vibrantes inspiradas em paraísos tropicais",
    category: "Vibrante",
    colors: [
      { name: "Turquoise", hex: "#40E0D0", rgb: "rgb(64, 224, 208)", usage: "Primary" },
      { name: "Teal", hex: "#008080", rgb: "rgb(0, 128, 128)", usage: "Secondary" },
      { name: "Aqua", hex: "#00FFFF", rgb: "rgb(0, 255, 255)", usage: "Accent" },
      { name: "Lime Green", hex: "#32CD32", rgb: "rgb(50, 205, 50)", usage: "Success" },
      { name: "Spring Green", hex: "#00FF7F", rgb: "rgb(0, 255, 127)", usage: "Highlight" },
    ],
  },
  {
    id: "forest-mist",
    name: "Forest Mist",
    description: "Paleta suave inspirada na névoa da floresta",
    category: "Suave",
    colors: [
      { name: "Sage Green", hex: "#9CAF88", rgb: "rgb(156, 175, 136)", usage: "Primary" },
      { name: "Eucalyptus", hex: "#44A08D", rgb: "rgb(68, 160, 141)", usage: "Secondary" },
      { name: "Powder Blue", hex: "#B0E0E6", rgb: "rgb(176, 224, 230)", usage: "Light" },
      { name: "Sea Green", hex: "#2E8B57", rgb: "rgb(46, 139, 87)", usage: "Accent" },
      { name: "Mint Cream", hex: "#F5FFFA", rgb: "rgb(245, 255, 250)", usage: "Background" },
    ],
  },
  {
    id: "arctic-aurora",
    name: "Arctic Aurora",
    description: "Inspirada nas cores da aurora boreal",
    category: "Mística",
    colors: [
      { name: "Arctic Blue", hex: "#4682B4", rgb: "rgb(70, 130, 180)", usage: "Primary" },
      { name: "Ice Blue", hex: "#B0E0E6", rgb: "rgb(176, 224, 230)", usage: "Light" },
      { name: "Aurora Green", hex: "#00FF7F", rgb: "rgb(0, 255, 127)", usage: "Accent" },
      { name: "Teal Blue", hex: "#008B8B", rgb: "rgb(0, 139, 139)", usage: "Secondary" },
      { name: "Frost White", hex: "#F0F8FF", rgb: "rgb(240, 248, 255)", usage: "Background" },
    ],
  },
  {
    id: "corporate-blue-green",
    name: "Corporate Blue-Green",
    description: "Paleta profissional para ambientes corporativos",
    category: "Corporativo",
    colors: [
      { name: "Corporate Blue", hex: "#1E3A8A", rgb: "rgb(30, 58, 138)", usage: "Primary" },
      { name: "Business Green", hex: "#059669", rgb: "rgb(5, 150, 105)", usage: "Secondary" },
      { name: "Professional Gray", hex: "#6B7280", rgb: "rgb(107, 114, 128)", usage: "Neutral" },
      { name: "Success Green", hex: "#10B981", rgb: "rgb(16, 185, 129)", usage: "Success" },
      { name: "Light Blue", hex: "#DBEAFE", rgb: "rgb(219, 234, 254)", usage: "Background" },
    ],
  },
]

export default function Component() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { toast } = useToast()

  const copyToClipboard = async (text: string, colorName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedColor(text)
      toast({
        title: "Cor copiada!",
        description: `${colorName}: ${text} foi copiado para a área de transferência.`,
      })
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a cor para a área de transferência.",
        variant: "destructive",
      })
    }
  }

  const toggleFavorite = (paletteId: string) => {
    setFavorites((prev) => (prev.includes(paletteId) ? prev.filter((id) => id !== paletteId) : [...prev, paletteId]))
  }

  const exportPalette = (palette: ColorPalette) => {
    const paletteData = {
      name: palette.name,
      description: palette.description,
      colors: palette.colors.map((color) => ({
        name: color.name,
        hex: color.hex,
        rgb: color.rgb,
      })),
    }

    const dataStr = JSON.stringify(paletteData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${palette.name.toLowerCase().replace(/\s+/g, "-")}-palette.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Paleta exportada!",
      description: `A paleta "${palette.name}" foi exportada com sucesso.`,
    })
  }

  const categories = ["all", ...Array.from(new Set(colorPalettes.map((p) => p.category)))]
  const filteredPalettes =
    selectedCategory === "all" ? colorPalettes : colorPalettes.filter((p) => p.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Palette className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Paletas Azul & Verde
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore nossa coleção curada de paletas de cores com tons predominantes de azul e verde, perfeitas para seus
            projetos de design.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-gradient-to-r from-blue-600 to-green-600 text-white"
                  : "hover:bg-blue-50"
              }
            >
              {category === "all" ? "Todas" : category}
            </Button>
          ))}
        </div>

        {/* Palettes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPalettes.map((palette) => (
            <Card key={palette.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">{palette.name}</CardTitle>
                    <CardDescription className="mt-1">{palette.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(palette.id)}
                      className="hover:bg-red-50"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.includes(palette.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportPalette(palette)}
                      className="hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit mt-2">
                  {palette.category}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Color Preview */}
                <div className="flex h-16 rounded-lg overflow-hidden shadow-inner">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 cursor-pointer hover:scale-105 transition-transform duration-200"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex, color.name)}
                      title={`${color.name}: ${color.hex}`}
                    />
                  ))}
                </div>

                {/* Color Details */}
                <Tabs defaultValue="hex" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="hex">HEX</TabsTrigger>
                    <TabsTrigger value="rgb">RGB</TabsTrigger>
                  </TabsList>

                  <TabsContent value="hex" className="space-y-2 mt-4">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div>
                            <span className="font-medium text-gray-800">{color.name}</span>
                            <div className="text-xs text-gray-500">{color.usage}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-white px-2 py-1 rounded border">{color.hex}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(color.hex, color.name)}
                            className="hover:bg-blue-50"
                          >
                            {copiedColor === color.hex ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-blue-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="rgb" className="space-y-2 mt-4">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div>
                            <span className="font-medium text-gray-800">{color.name}</span>
                            <div className="text-xs text-gray-500">{color.usage}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-white px-2 py-1 rounded border">{color.rgb}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(color.rgb, color.name)}
                            className="hover:bg-blue-50"
                          >
                            {copiedColor === color.rgb ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-blue-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white/50 rounded-lg backdrop-blur-sm">
          <p className="text-gray-600">
            Todas as funcionalidades foram preservadas: copiar cores, favoritar paletas, exportar dados, filtrar por
            categoria e visualização responsiva.
          </p>
        </div>
      </div>
    </div>
  )
}
