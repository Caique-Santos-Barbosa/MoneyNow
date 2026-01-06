import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Crown, 
  Check, 
  X, 
  Infinity, 
  Zap, 
  BarChart3, 
  Shield, 
  Bell, 
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CheckoutModal from '@/components/premium/CheckoutModal';
import PremiumBadge from '@/components/premium/PremiumBadge';

const benefits = [
  {
    icon: Infinity,
    title: 'Contas ilimitadas',
    description: 'Gerencie todas as suas contas bancárias, carteiras digitais e investimentos em um só lugar'
  },
  {
    icon: Zap,
    title: 'Sincronização automática',
    description: 'Conecte seu banco via Open Banking e suas transações são importadas automaticamente'
  },
  {
    icon: BarChart3,
    title: 'Relatórios avançados',
    description: 'Análises profundas com gráficos interativos e insights personalizados sobre suas finanças'
  },
  {
    icon: Shield,
    title: 'Backup automático',
    description: 'Seus dados são salvos automaticamente todos os dias. Nunca perca suas informações financeiras'
  },
  {
    icon: Bell,
    title: 'Alertas inteligentes',
    description: 'Receba notificações personalizadas sobre vencimentos, metas e gastos acima do normal'
  },
  {
    icon: Download,
    title: 'Exportação completa',
    description: 'Exporte seus dados em Excel, PDF ou CSV para usar em outras ferramentas'
  }
];

const comparisonFeatures = [
  { name: 'Contas bancárias', free: 'Até 2', premium: 'Ilimitado', highlight: true },
  { name: 'Cartões de crédito', free: 'Até 2', premium: 'Ilimitado', highlight: true },
  { name: 'Categorias personalizadas', free: 'Até 5', premium: 'Ilimitado' },
  { name: 'Open Banking', free: false, premium: true, highlight: true },
  { name: 'Backup automático', free: false, premium: 'Diário', highlight: true },
  { name: 'Relatórios', free: 'Básicos', premium: 'Avançados' },
  { name: 'Exportação de dados', free: 'CSV', premium: 'CSV, Excel, PDF' },
  { name: 'Anexos em transações', free: false, premium: true },
  { name: 'Metas financeiras', free: 'Até 3', premium: 'Ilimitado' },
  { name: 'Alertas inteligentes', free: 'Básicos', premium: 'Personalizados' },
  { name: 'Suporte', free: 'Email (48h)', premium: 'Prioritário (24h)' },
  { name: 'Anúncios', free: 'Sim', premium: false }
];

const testimonials = [
  {
    rating: 5,
    quote: 'Depois que virei Premium, consegui organizar todas as minhas 5 contas. Valeu cada centavo!',
    author: 'Maria Silva',
    location: 'São Paulo'
  },
  {
    rating: 5,
    quote: 'A sincronização automática me economiza horas por mês. Não consigo mais viver sem!',
    author: 'João Santos',
    location: 'Rio de Janeiro'
  },
  {
    rating: 5,
    quote: 'Os relatórios avançados me ajudaram a economizar R$ 800 no primeiro mês. O app já se pagou!',
    author: 'Ana Costa',
    location: 'Belo Horizonte'
  }
];

const faqs = [
  {
    question: 'Como funciona o teste grátis de 7 dias?',
    answer: 'Você tem acesso completo a todos os recursos Premium por 7 dias, sem precisar cadastrar cartão de crédito. Após o período, você decide se quer continuar com o plano pago.'
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento nas configurações. Não há multas ou taxas de cancelamento.'
  },
  {
    question: 'Como funciona o parcelamento?',
    answer: 'Você pode parcelar o valor anual de R$ 100,00 em até 10x de R$ 10,00 sem juros no cartão de crédito. O parcelamento é feito em uma única compra.'
  },
  {
    question: 'O que acontece se eu cancelar no meio do período?',
    answer: 'Você continua tendo acesso aos recursos Premium até o final do período já pago. Não fazemos reembolso proporcional.'
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Utilizamos criptografia de ponta e seguimos todas as normas da LGPD. Seus dados financeiros nunca são compartilhados com terceiros.'
  },
  {
    question: 'Posso usar em vários dispositivos?',
    answer: 'Sim! Com o Premium você pode usar o MoneyNow em quantos dispositivos quiser, com sincronização automática entre eles.'
  }
];

export default function Premium() {
  const [user, setUser] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  return (
    <div className="pb-20 lg:pb-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#6C40D9] via-[#8A5FE6] to-[#6C40D9] text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <PremiumBadge size="md" variant="gradient" />
          
          <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-4">
            Controle total das suas finanças
          </h1>
          
          <p className="text-xl text-white/80 mb-8">
            Desbloqueie todos os recursos e transforme sua vida financeira
          </p>

          <div className="inline-block p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-8">
            <p className="text-sm text-white/70 mb-2">Por apenas</p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-5xl font-bold">R$ 100</span>
              <span className="text-2xl text-white/70 mb-2">/ano</span>
            </div>
            <p className="text-white/70 mt-2">ou 10x de R$ 10,00 sem juros</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-[#6C40D9] hover:bg-white/90 text-lg px-8"
              onClick={() => setCheckoutOpen(true)}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Começar teste grátis de 7 dias
            </Button>
          </div>
          
          <p className="text-sm text-white/60 mt-4">
            ✅ Cancele quando quiser • ✅ Sem compromisso • ✅ Suporte dedicado
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Compare os planos
        </h2>

        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900">Recursos</th>
                  <th className="p-4 text-center">
                    <Badge variant="outline" className="text-gray-600">Gratuito</Badge>
                  </th>
                  <th className="p-4 text-center bg-[#6C40D9]/5">
                    <PremiumBadge size="sm" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr 
                    key={index} 
                    className={feature.highlight ? 'bg-[#6C40D9]/5' : ''}
                  >
                    <td className="p-4 font-medium text-gray-900 border-t">
                      {feature.name}
                    </td>
                    <td className="p-4 text-center border-t">
                      {feature.free === false ? (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : feature.free === true ? (
                        <Check className="w-5 h-5 text-gray-400 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600">{feature.free}</span>
                      )}
                    </td>
                    <td className="p-4 text-center border-t bg-[#6C40D9]/5">
                      {feature.premium === false ? (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : feature.premium === true ? (
                        <Check className="w-5 h-5 text-[#00D68F] mx-auto" />
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5 text-[#00D68F]" />
                          <span className="text-sm font-medium text-gray-900">{feature.premium}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Benefits Grid */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher Premium?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#6C40D9]/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-[#6C40D9]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          O que nossos usuários Premium dizem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Perguntas frequentes
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border-0 bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                <span className="font-medium text-gray-900 text-left">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-[#6C40D9] to-[#8A5FE6] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Junte-se a milhares de usuários que já estão no controle do seu dinheiro
          </p>
          <Button 
            size="lg"
            className="bg-white text-[#6C40D9] hover:bg-white/90 text-lg px-8"
            onClick={() => setCheckoutOpen(true)}
          >
            <Crown className="w-5 h-5 mr-2" />
            Assinar MoneyNow Premium
          </Button>
          <p className="text-sm text-white/60 mt-4">
            ✅ 7 dias grátis • ✅ Cancele quando quiser • ✅ Suporte dedicado
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          setCheckoutOpen(false);
          loadUser();
        }}
      />
    </div>
  );
}