/**
 * Условия использования
 * @module app/terms/page
 */

'use client';

import { MainLayout } from '@/components/layout';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="py-4 md:py-8 pb-32 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/account" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад в аккаунт
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Условия использования</h1>
              <p className="text-gray-500">Citrus Music • Последнее обновление: 1 января 2026 г.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-neutral-800 prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">1. Общие положения</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Настоящие Условия использования (далее — «Условия») регулируют отношения между 
              командой разработчиков Citrus Team (далее — «Мы», «Администрация») и пользователем 
              сервиса Citrus Music (далее — «Сервис», «Приложение»).
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              Используя Сервис, вы подтверждаете, что полностью ознакомились с настоящими Условиями, 
              понимаете их и принимаете в полном объёме.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">2. Описание сервиса</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Citrus Music — это веб-приложение для прослушивания музыки, которое интегрируется 
              со сторонними музыкальными сервисами (ВКонтакте, Яндекс Музыка) и предоставляет 
              пользователям удобный интерфейс для воспроизведения аудиоконтента.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              Сервис является клиентским приложением и не хранит музыкальный контент на своих серверах. 
              Весь аудиоконтент предоставляется соответствующими сторонними сервисами в соответствии 
              с их условиями использования.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">3. Правила использования</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              При использовании Сервиса пользователь обязуется:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Соблюдать действующее законодательство Российской Федерации</li>
              <li>Не нарушать авторские и смежные права третьих лиц</li>
              <li>Не использовать Сервис в коммерческих целях без согласия Администрации</li>
              <li>Не предпринимать действий, направленных на нарушение работы Сервиса</li>
              <li>Не распространять вредоносное программное обеспечение</li>
              <li>Соблюдать условия использования интегрированных сторонних сервисов</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">4. Интеллектуальная собственность</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Все права на дизайн, код и элементы интерфейса Сервиса принадлежат Citrus Team. 
              Музыкальный контент, доступный через Сервис, является собственностью правообладателей 
              и предоставляется через API сторонних сервисов.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              Использование Сервиса не предоставляет пользователю никаких прав на интеллектуальную 
              собственность, за исключением ограниченного права использования в личных некоммерческих целях.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">5. Интеграция со сторонними сервисами</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Для работы с музыкальным контентом Сервис использует API следующих платформ:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-4">
              <li>
                <strong>ВКонтакте:</strong> для доступа к аудиозаписям из библиотеки пользователя. 
                При использовании этой интеграции применяются{' '}
                <a 
                  href="https://vk.com/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:underline"
                >
                  Правила пользования сайтом ВКонтакте
                </a>
              </li>
              <li>
                <strong>Яндекс Музыка:</strong> для идентификации пользователя. 
                При использовании применяются{' '}
                <a 
                  href="https://yandex.ru/legal/rules/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:underline"
                >
                  Условия использования сервисов Яндекса
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">6. Ограничение ответственности</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Сервис предоставляется «как есть» (as is). Администрация не несёт ответственности за:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-4">
              <li>Временную недоступность Сервиса или его отдельных функций</li>
              <li>Качество и доступность контента, предоставляемого сторонними сервисами</li>
              <li>Действия пользователей, нарушающие условия использования сторонних сервисов</li>
              <li>Любые убытки, возникшие в результате использования или невозможности использования Сервиса</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">7. Учётные данные</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Пользователь несёт полную ответственность за сохранность своих учётных данных 
              и токенов доступа. Администрация настоятельно рекомендует:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-4">
              <li>Не передавать токены доступа третьим лицам</li>
              <li>Не использовать Сервис на общедоступных устройствах</li>
              <li>Регулярно проверять активные сессии в настройках безопасности сторонних сервисов</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">8. Изменение условий</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Администрация оставляет за собой право изменять настоящие Условия без 
              предварительного уведомления пользователей. Актуальная версия Условий всегда 
              доступна на данной странице. Продолжение использования Сервиса после внесения 
              изменений означает согласие пользователя с обновлёнными Условиями.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">9. Прекращение использования</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Пользователь может в любой момент прекратить использование Сервиса, очистив 
              локальное хранилище браузера и удалив сохранённые токены доступа. 
              Администрация оставляет за собой право ограничить доступ к Сервису 
              пользователям, нарушающим настоящие Условия.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">10. Применимое право</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Настоящие Условия регулируются законодательством Российской Федерации. 
              Все споры, возникающие в связи с использованием Сервиса, подлежат разрешению 
              в соответствии с действующим законодательством РФ.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">11. Контактная информация</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              По всем вопросам, связанным с использованием Сервиса, вы можете обратиться к нам 
              по электронной почте:{' '}
              <a 
                href="mailto:citrus.helper.team@gmail.com" 
                className="text-orange-500 hover:underline"
              >
                citrus.helper.team@gmail.com
              </a>
            </p>
          </section>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-neutral-700">
            <p className="text-sm text-gray-500 text-center">
              © 2025–2026 Citrus Team. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
