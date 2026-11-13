# Frictie als vorm: versies

Elke versie blijft te zien op een eigen adres. De hoofdpagina, https://aimhassan.github.io/frictie-als-vorm/, blijft versie 2 tot Aiman een nieuwe versie kiest. Die hoofdpagina is ook het doel van de QR-code in de NADD-talk.

## Versie 3, 13 november 2026

Adres: https://aimhassan.github.io/frictie-als-vorm/v3/

Van platformparodie naar counter-archief: het stuk houdt de fout en schrijft de correctie ernaast.

- **Het spoor corrigeert het platform.** Elke gewiste alinea laat het platformlog uit versie 2 achter, woord voor woord, nu met het label "simulatie: geen echt platformlog". Ernaast staat wat er bij deze lezing echt gebeurde: hoe lang de alinea op je scherm stond, de tijdcode van het wissen en het aantal woorden. Dat rekent de browser van de lezer zelf uit.
- **Niets verlaat het toestel.** Analytics is eruit: de code bevat geen netwerkverzoek meer. De lettertypes staan naast de pagina in plaats van bij Google Fonts. Een reactie verschijnt, wordt overschreven en gaat nergens heen; alleen het aantal tekens blijft als spoor. De pagina telt zelf de netwerkverzoeken na het laden en toont dat getal (gemeten: 0).
- **De footer corrigeert zichzelf.** De zin uit versie 2 ("Dit stuk registreert anoniem welke segmenten je las en wat je typte als reactie ...") blijft staan, doorgestreept, met de correctie ernaast.
- **Een einde dat op elk scherm klopt.** Na de feed volgt minstens een scherm ruimte, zodat ook de laatste alinea dezelfde regel volgt. Het slotspoor van versie 2 staat nu direct onder de feed, zodat het op elk scherm in beeld komt. Getest op schermen van 320 tot 2560 pixels breed: overal 10 van 10, 0% beschikbaar, slotspoor in beeld. Versie 2 eindigde op 7 tot 9 van 10, afhankelijk van het scherm.
- **De regel is uit te leggen.** Een alinea vervaagt zodra de onderkant ervan de helft van je scherm passeert en wordt gewist zodra die het bovenste derde bereikt. Dat staat ook in het archief.
- **De tekst verspringt niet meer.** Het gewiste stuk houdt de maat van wat er stond. In versie 2 schoof de tekst onder de lezer op de telefoon tot 86 pixels op bij een wissing; in versie 3 hooguit 1.
- **Toegang hoort bij het werk.** Grotere letter op de telefoon (ongeveer 21 in plaats van 14 pixels). Sporen zijn leesbaar voor schermlezers en elke wissing wordt gemeld. De focus blijft op zijn plek als de alinea eronder verdwijnt. "Hele tekst bekijken" onder de caption opent het archief: alle tien alinea's met hun sporen. Wie daarheen springt, slaat de feed over; de regel geldt dan ook voor die alinea's (op je scherm: 0,0 s). Bij minder beweging (reduced motion) werkt het hele stuk zonder animatie. Contrast verhoogd waar het te laag was.
- **Glitch.** De tekenvervanging blijft: het systeem schrijft over de tekst heen. De rood-blauwe beeldsplitsing is eruit; dat was decor, geen regel.
- **"lees meer"** klapt de caption nu echt uit, met de rest van de eerste alinea.

### Nieuwe zinnen in versie 3, nog niet door Aiman goedgekeurd

Zijn alinea's en //-regels staan er woord voor woord. Deze zinnen zijn nieuw en wachten op zijn stem:

- onder de caption: "Hele tekst bekijken"
- labels bij elk spoor: "simulatie: geen echt platformlog" en "gemeten: op dit toestel, niets verstuurd"
- regels in het spoor: "op je scherm", "gewist op", "woorden", "reactie: ... tekens, niet verstuurd"
- onder een reactie: "correctie: ook niet voor iemand anders. niets verstuurd."
- archief: "De hele tekst, met jouw sporen", de regel, "tijdcodes tellen vanaf het openen van deze pagina", en de lijst bewaard, niet bewaard, verstuurd
- footer: "versie 2 zei" en "correctie: Dit stuk registreert niets en verstuurt niets. Je sporen blijven in dit tabblad en verdwijnen als je het sluit. Alleen het laden van de pagina loopt via GitHub Pages."
- slotspoor: het getal achter "segmenten gelezen" wordt nu gemeten (alinea's die op je scherm stonden) in plaats van altijd 10.

## Versie 2, 17 mei 2026

Adres: https://aimhassan.github.io/frictie-als-vorm/v2/ (en voorlopig ook de hoofdpagina)

De versie die sinds 17 mei live staat. In de code heet ze `scrollverhaal_v3` en de stylesheet noemt zich v4. Ongewijzigd bewaard, met wat versie 3 corrigeert:

- het einde hangt af van het scherm: op de telefoon 9 van 10, op een laptop 8 van 10, en het slotspoor komt niet altijd in beeld;
- de footer belooft registratie, terwijl het adres waar de gegevens heen gaan op 12 november 404 gaf en de code reactietekst verstuurt;
- het platformlog bevat verzonnen getallen zonder label;
- na het wissen krijgt een schermlezer niets meer, en de tekst op de telefoon is ongeveer 14 pixels.
