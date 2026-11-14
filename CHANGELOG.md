# Frictie als vorm: versies

Elke versie blijft te zien op een eigen adres. Sinds 14 november is de hoofdpagina, https://aimhassan.github.io/frictie-als-vorm/, versie 3: dat koos Aiman. Die hoofdpagina is ook het doel van de QR-code in de NADD-talk. De hoofdpagina gebruikt de bestanden uit /v3/; alleen index.html staat er apart, met aangepaste paden.

## Versie 5, 14 november 2026

Adres: https://aimhassan.github.io/frictie-als-vorm/v5/

Na Aimans feedback op versie 4:

- **Een post per scherm.** Elke alinea vult het scherm, zoals in een feed: grote tekst in het midden, de knoppen in een kolom rechts, onderaan @aimanhassani en een teller (01/10), zodat je ziet waar je bent. Elke veeg of scrollstap gaat naar de volgende post. Bij minder beweging (reduced motion) staat het vastklikken uit.
- **Geen herhaling bovenaan.** De aparte post met caption en "lees meer" is weg; het stuk begint meteen bij de eerste alinea.
- **Alinea 04 herschreven**, zodat ze klopt: "Als ik een video post, zie ik daarna hoe lang mensen kijken. De meesten zijn na een paar seconden weg. Ik merk dat ik sneller ga praten. Alsof ik solliciteer."
- **Alinea 07:** zijn moeder praat Marokkaans en Nederlands door elkaar. Het log eronder zegt dat de taal binnen een zin wisselt.
- **"scroll" met dubbele l**, zoals Aiman het schrijft.
- De regel kijkt nu naar de tekst in de post, niet naar de lege ruimte eromheen. Verder werkt alles als in versie 4; getest op 9 schermformaten en met reduced motion. De hoofdpagina blijft versie 3 tot Aiman kiest.

Nieuw in versie 5 en nog niet door Aiman goedgekeurd: alinea 04 en de logregels bij 04 en 07.

## Versie 4, 14 november 2026

Adres: https://aimhassan.github.io/frictie-als-vorm/v4/

- **Nieuwe teksten.** Alle tien alinea's zijn opnieuw geschreven, dichter bij Aimans eigen stem: ik, korte zinnen, iets concreets, en een landing in plaats van een slotsom. Samen 243 woorden, was ongeveer 500. Alinea 03 gebruikt zijn eigen zinnen over zijn film Bliksem; alinea 05 is zijn eigen statement over frictie, in het Nederlands; alinea 08 begint met een zin uit zijn eigen notities.
- **Het platformlog** volgt de nieuwe alinea's; een paar regels zijn kaler gemaakt. Het log bij de moeder-alinea staat er zoals Aiman besloot.
- **Het slotspoor** herhaalt de laatste alinea niet meer, en de meting eronder is kaal: "gemeten: 10 van 10 alinea's op je scherm. gelezen: niet te meten."
- Verder werkt alles als in versie 3, getest met hetzelfde script op 9 schermformaten en met reduced motion. De hoofdpagina blijft versie 3 tot Aiman kiest.

Nieuw in versie 4 en nog niet door Aiman goedgekeurd: de tien alinea's, de nieuwe logregels, de correctie onder een reactie ("correctie: niet verstuurd. nergens opgeslagen.") en de meting onder het slotspoor.

## Versie 3, 13 november 2026

Adres: https://aimhassan.github.io/frictie-als-vorm/v3/

Van platformparodie naar counter-archief: het stuk houdt de fout en schrijft de correctie ernaast.

- **Het spoor corrigeert het platform.** Elke gewiste alinea laat het platformlog uit versie 2 achter, met het label "simulatie: geen echt platformlog". Ernaast staat wat er bij deze lezing gemeten is: hoe lang de alinea op je scherm stond, de tijdcode van het wissen en het aantal woorden. Dat rekent de browser van de lezer zelf uit. Of iemand las, meet het stuk niet.
- **Dit stuk verstuurt niets.** Analytics is eruit: de code bevat geen netwerkverzoek meer. De lettertypes staan naast de pagina in plaats van bij Google Fonts. Een reactie verschijnt, wordt overschreven en gaat nergens heen; alleen het aantal tekens blijft als spoor, in dit tabblad. Het laden van de pagina gaat via GitHub Pages; daarna telt de pagina zelf de netwerkverzoeken en toont dat getal (gemeten: 0).
- **De footer corrigeert zichzelf.** De zin uit versie 2 ("Dit stuk registreert anoniem welke segmenten je las en wat je typte als reactie ...") blijft staan, doorgestreept, met de correctie ernaast.
- **Een einde dat op elk scherm klopt.** Na de feed volgt minstens een scherm ruimte, zodat ook de laatste alinea dezelfde regel volgt. Het slotspoor uit versie 2 staat woord voor woord direct onder de feed, zodat het op elk scherm in beeld komt, met de meting eronder. Versie 2 eindigde op 7 tot 9 van de 10 gewiste alinea's, afhankelijk van het scherm.
- **De regel is uit te leggen.** Een alinea die op je scherm heeft gestaan, vervaagt zodra je verder scrolt en de onderkant de helft van je scherm passeert, en wordt gewist zodra die het bovenste derde bereikt. Wat je overslaat, blijft staan. Dat staat ook in het archief.
- **De tekst verspringt niet meer.** Het gewiste stuk houdt de maat van wat er stond. In versie 2 schoof de tekst onder de lezer op de telefoon tot 86 pixels op bij een wissing; in versie 3 hooguit 1.
- **Toegang hoort bij het werk.** Grotere letter op de telefoon (ongeveer 21 in plaats van 14 pixels). Sporen zijn leesbaar voor schermlezers en elke wissing wordt gemeld. De focus blijft op zijn plek als de alinea eronder verdwijnt. Na het einde staat het archief: alle tien alinea's met hun gemeten sporen. Voor toetsenbord en schermlezer staat bovenaan een onzichtbare link naar dat archief; die verschijnt pas als je op Tab drukt, en springen wist niets. Bij minder beweging (reduced motion) werkt het hele stuk zonder animatie. Contrast verhoogd waar het te laag was.
- **Glitch.** De tekenvervanging blijft: het systeem schrijft over de tekst heen. De rood-blauwe beeldsplitsing is eruit; dat was decor, geen regel.
- **"lees meer"** klapt de caption nu echt uit, met de rest van de eerste alinea.

Getest met een Playwright-script dat in deze repo staat (`_tests/test_scroll_versions.py`; het draait lokaal en tegen de live site), lokaal en op de live site, op 9 schermformaten van 320 tot 2560 pixels breed en met reduced motion: overal worden alle tien alinea's gewist, eindigt de teller op 0% beschikbaar en komt het slotspoor in beeld; geen netwerkverzoeken na het laden en geen verzoeken naar andere sites.

### Na de review van p22-worker (13 november, avond)

p22-worker toetste de eerste publicatie van versie 3 (commit 37a1fa2) aan de conceptbrief, op kaart t_e4604025. Wat daarna veranderde:

- **De zevende alinea, over de moeder:** p22-worker adviseerde het hele verzonnen transcriptielog weg te halen (job-id voice_note_47, de foutstatus, de taalregel, de stilte van 1.8s, de LOST-regels en de Arabische vraag). Aiman besliste anders, zie hieronder. Het log staat er weer woord voor woord zoals in versie 2, gelabeld als simulatie.
- **Springen wist niet meer.** Alleen wat op je scherm heeft gestaan, kan verdwijnen. Wie via de link naar het archief springt, laat de feed heel. Terugscrollen voordat een alinea de lijn passeert, haalt hem nog even terug.
- **Preciezere privacyzinnen.** "Dit stuk registreert niets" was te absoluut: het stuk meet wel, alleen in het tabblad. De correctie in de footer luidt nu: "Dit stuk verstuurt niets. Wat het meet, blijft in dit tabblad en is weg zodra je het sluit. Alleen het laden van de pagina gaat via GitHub Pages."
- **Het slotspoor staat er weer woord voor woord**, met "segmenten gelezen: 10". Lezen meet niemand, dus staat de meting eronder: "gemeten: 10 van 10 alinea's stonden op je scherm. of je ze las, meet niemand."
- **Het archief heet nu** "De hele tekst, met de sporen van dit scherm". Bij een gewiste alinea begint het spoor daar met "gemeten:"; een alinea die nog in de feed staat, toont "nog in de feed" en haar aantal woorden.

p22-worker hercheckte versie 3 op 14 november (kaart t_6dbbbbe2): akkoord op de simulatielabels, het moeder-log volgens Aimans besluit, de metingen en privacyzinnen, de archiefroute, de footercorrectie en het slotspoor met de meting eronder. De laatste restfout zat in deze changelog (de beschrijving van de archiefsporen) en is daarna verbeterd.

### Besluiten van Aiman

- 14 november: de Arabische vraag en "// geen antwoord beschikbaar." bij de moeder-alinea blijven staan.
- 14 november: "I dont mind any fiction elements if they are to strengthen the story." Fictie die het verhaal sterker maakt, mag dus, ook in het log bij de moeder-alinea. In versie 3 staat die fictie gelabeld als simulatie. Wat de pagina zegt over lezers en hun gegevens, blijft feitelijk: dat is geen verhaal maar een belofte.
- 14 november: versie 3 wordt de hoofdpagina, en daarmee ook het adres achter de QR-code in de NADD-talk. Versie 2 blijft te zien op /v2/.
- 14 november: geen zichtbare knop "Hele tekst bekijken" bovenaan. Aiman: "its a scroll interface forcing u down". Iedereen moet dus naar beneden; de hele tekst staat pas na het einde. Alleen toetsenbord en schermlezer krijgen bovenaan een onzichtbare link naar het archief, zodat het stuk toegankelijk blijft.

### Nieuwe zinnen in versie 3, nog niet door Aiman goedgekeurd

De alinea's, het slotspoor en de //-regels uit versie 2 staan er woord voor woord. Deze zinnen zijn nieuw en wachten op Aimans stem:

- onzichtbare link voor toetsenbord en schermlezer: "Naar de hele tekst"
- labels bij elk spoor: "simulatie: geen echt platformlog" en "gemeten: op dit toestel, niets verstuurd"
- regels in het spoor: "op je scherm", "gewist op", "woorden", "reactie: ... tekens, niet verstuurd"
- onder een reactie: "correctie: ook niet voor iemand anders. niets verstuurd."
- onder het slotspoor: "gemeten: 10 van 10 alinea's stonden op je scherm. of je ze las, meet niemand."
- archief: "De hele tekst, met de sporen van dit scherm", de regel, "tijdcodes tellen vanaf het openen van deze pagina", en de lijst bewaard, niet bewaard, verstuurd
- footer: "versie 2 zei" en "correctie: Dit stuk verstuurt niets. Wat het meet, blijft in dit tabblad en is weg zodra je het sluit. Alleen het laden van de pagina gaat via GitHub Pages."

## Versie 2, 17 mei 2026

Adres: https://aimhassan.github.io/frictie-als-vorm/v2/ (tot 14 november ook de hoofdpagina)

De versie die sinds 17 mei live staat. In de code heet ze `scrollverhaal_v3` en de stylesheet noemt zich v4. Ongewijzigd bewaard, met wat versie 3 corrigeert:

- het einde hangt af van het scherm: op de telefoon worden 9 van de 10 alinea's gewist, op een laptop 8, en het slotspoor komt niet altijd in beeld;
- de footer belooft registratie, terwijl het adres waar de gegevens heen gaan op 12 november 404 gaf en de code reactietekst verstuurt;
- het platformlog bevat verzonnen getallen zonder label, ook over de voice-note van de moeder;
- na het wissen krijgt een schermlezer niets meer, en de tekst op de telefoon is ongeveer 14 pixels.
