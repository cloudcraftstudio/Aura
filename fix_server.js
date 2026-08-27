const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/'gemini-3\.7-flash'/g, "'gemini-2.5-flash'");
code = code.replace(/"gemini-3\.1-flash-tts-preview"/g, "'gemini-2.5-flash'");

// Replace the image generation call
code = code.replace(/const response = await ai\.models\.generateContent\(\{[\s\S]*?model: 'gemini-3\.1-flash-lite-image'[\s\S]*?\}\);/m, 
`const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          aspectRatio: "1:1"
        }
      });`);

// Fix the base64 extraction for imagen
code = code.replace(/let imageUrl = null;[\s\S]*?for \(const part of response\.candidates\?\.\[0\]\?\.content\?\.parts \|\| \[\]\) \{[\s\S]*?if \(part\.inlineData\) \{[\s\S]*?imageUrl = \`data:\$\{part\.inlineData\.mimeType \|\| 'image\/png'\};base64,\$\{part\.inlineData\.data\}\`;[\s\S]*?break;[\s\S]*?\}[\s\S]*?\}/m,
`let imageUrl = null;
      if (response.generatedImages && response.generatedImages.length > 0) {
        const imageBytes = response.generatedImages[0].image.imageBytes;
        imageUrl = \`data:image/png;base64,\${imageBytes}\`;
      }`);

fs.writeFileSync('server.ts', code);
