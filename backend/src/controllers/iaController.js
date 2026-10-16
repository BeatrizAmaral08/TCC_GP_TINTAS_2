const coresDisponiveis = {
  Branco: "#F2F0ED",
  Bege: "#C9B69A",
  "Azul Claro": "#8EAFCA",
  "Verde Oliva": "#777D56",
  Terracota: "#C45B30",
  "Cinza Grafite": "#4B4B4B"
};

export async function simularCor(req, res) {
  try {
    const { nomeCor } = req.body;
    const foto = req.file;

    if (!foto) {
      return res.status(400).json({ message: "Envie uma foto do ambiente." });
    }

    if (!coresDisponiveis[nomeCor]) {
      return res.status(400).json({ message: "Escolha uma cor disponível na GP Tintas." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "A chave da IA não está configurada no servidor." });
    }

    const corHex = coresDisponiveis[nomeCor];
    const formulario = new FormData();
    formulario.append("model", "gpt-image-1.5");
    formulario.append("image", new Blob([foto.buffer], { type: foto.mimetype }), `ambiente.${foto.mimetype.split("/")[1].replace("jpeg", "jpg")}`);
    formulario.append("prompt", `Edite a fotografia para simular uma pintura residencial realista. Pinte somente as paredes pintáveis com a cor ${nomeCor}, código hexadecimal ${corHex}. Preserve a composição, perspectiva, iluminação, sombras, móveis, sofás, cortinas, plantas, quadros, portas, janelas, rodapés, pisos, teto e todos os outros objetos. Não adicione nem remova elementos. Respeite os limites entre as paredes e os objetos. Se não conseguir identificar uma superfície com segurança como parede, deixe-a sem alteração. Retorne somente a fotografia editada, sem textos ou legendas.`);
    formulario.append("size", "1536x1024");
    formulario.append("quality", "medium");
    formulario.append("output_format", "png");

    const resposta = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: formulario
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error("Erro da API de imagens:", dados);
      return res.status(502).json({ message: "Não foi possível gerar a simulação. Confira a chave, o acesso à API e o faturamento da conta." });
    }

    const imagemBase64 = dados.data?.[0]?.b64_json;
    if (!imagemBase64) {
      return res.status(502).json({ message: "A IA não retornou uma imagem." });
    }

    return res.json({ nomeCor, cor: corHex, imagem: `data:image/png;base64,${imagemBase64}` });
  } catch (error) {
    console.error("Erro ao simular cor:", error);
    return res.status(500).json({ message: "Ocorreu um erro ao simular a cor do ambiente." });
  }
}
