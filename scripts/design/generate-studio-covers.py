"""Original editorial illustrations for NewWave's fictional demonstration stories.
Run with Pillow from the repository root. No external images or provider calls.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/studio-covers'
OUT.mkdir(exist_ok=True)
W,H=1152,800
INK='#193b2c';CLAY='#995137';PAPER='#f5f3ed'

def label(draw,x,y,words,size=100,color=INK):
    f=ImageFont.truetype(str(ROOT/'public/fonts/inter-tight.ttf'),size)
    f.set_variation_by_axes([750])
    for n,word in enumerate(words):draw.text((x,y+n*size),word,font=f,fill=color,anchor='lt')

def illustration(name,bg,title):
    im=Image.new('RGB',(W,H),bg);d=ImageDraw.Draw(im)
    label(d,65,60,title,96,PAPER if name=='memory' else INK)
    if name=='makers':
        # A neighbourhood desk: windows, a warm lamp and a real object silhouette.
        d.rectangle((675,300,1080,650),fill=INK)
        for x in [705,800,895,990]:
            for y in [325,420,515]:d.rectangle((x,y,x+60,y+60),fill=PAPER)
        d.polygon([(58,622),(495,622),(580,686),(15,686)],fill=INK)
        d.rounded_rectangle((108,361,478,623),radius=20,fill=INK)
        d.rectangle((130,382,456,592),fill='#bacbb6')
        label(d,162,430,['make','something.'],50)
        d.line((495,746,495,440),fill=INK,width=12)
        d.ellipse((473,407,578,451),fill=INK)
        d.rectangle((0,748,W,H),fill=INK)
    elif name=='memory':
        # A record sleeve and spoken-memory waveform, without borrowed cultural motifs.
        d.ellipse((500,245,1110,855),fill=PAPER)
        d.ellipse((535,280,1075,820),fill=INK)
        for i in range(12):
            v=30+i*15;d.ellipse((805-v,550-v,805+v,550+v),outline='#56574b',width=2)
        d.ellipse((747,492,863,608),fill=CLAY)
        for i,h in enumerate([20,55,95,130,82,38,100,148,67,25,70,110]):
            x=70+i*31;d.rounded_rectangle((x,595-h,x+13,595+h),radius=6,fill=PAPER)
        label(d,65,730,['listen. remember. carry it forward.'],25,PAPER)
    elif name=='library':
        # Books and an open doorway as the objects of a community reading space.
        d.rectangle((700,280,1075,735),fill=INK)
        d.rectangle((729,309,1046,735),fill=CLAY)
        d.ellipse((845,366,936,457),fill=INK)
        d.rounded_rectangle((825,478,956,686),radius=42,fill=INK)
        d.rectangle((0,735,W,H),fill=INK)
        for x,y,bw,bh in [(80,660,450,50),(112,590,370,65),(65,524,475,57),(157,444,330,74)]:
            d.rectangle((x,y,x+bw,y+bh),fill=INK)
            d.rectangle((x+17,y+10,x+bw-15,y+bh-10),fill=PAPER)
        label(d,772,653,['come in.'],40,PAPER)
    else:
        # Cultivated fields, a horizon and a sun; no fabricated documentary image.
        d.ellipse((880,69,1040,229),fill=CLAY)
        d.polygon([(0,468),(400,342),(700,420),(1152,326),(1152,800),(0,800)],fill=INK)
        for offset in range(-5,9):
            d.line((580+offset*28,380,580+offset*205,840),fill=bg,width=14)
        d.line((0,557,W,557),fill=bg,width=14)
        d.line((0,670,W,670),fill=bg,width=14)
        label(d,65,707,['grow. learn. begin again.'],33,PAPER)
    im.save(OUT/f'{name}.png',optimize=True)

illustration('makers','#e7dfd0',['Ideas from','everyday life.'])
illustration('memory','#213c31',['The stories','we carry.'])
illustration('library','#cbd9c3',['A place','to belong.'])
illustration('land','#e4d8c6',['Learning','from the land.'])
print('Four original fictional-story illustrations generated.')
