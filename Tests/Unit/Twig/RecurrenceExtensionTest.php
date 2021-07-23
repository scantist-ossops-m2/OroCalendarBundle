<?php

namespace Oro\Bundle\CalendarBundle\Tests\Unit\Twig;

use Oro\Bundle\CalendarBundle\Entity;
use Oro\Bundle\CalendarBundle\Model\Recurrence;
use Oro\Bundle\CalendarBundle\Model\Recurrence\StrategyInterface;
use Oro\Bundle\CalendarBundle\Twig\RecurrenceExtension;
use Oro\Component\Testing\Unit\TwigExtensionTestCaseTrait;
use Symfony\Contracts\Translation\TranslatorInterface;

class RecurrenceExtensionTest extends \PHPUnit\Framework\TestCase
{
    use TwigExtensionTestCaseTrait;

    /** @var \PHPUnit\Framework\MockObject\MockObject */
    private $translator;

    /** @var \PHPUnit\Framework\MockObject\MockObject */
    private $strategy;

    /** @var \PHPUnit\Framework\MockObject\MockObject */
    private $recurrenceModel;

    /** @var RecurrenceExtension */
    private $extension;

    protected function setUp(): void
    {
        $this->translator = $this->createMock(TranslatorInterface::class);
        $this->strategy = $this->createMock(StrategyInterface::class);
        $this->recurrenceModel = new Recurrence($this->strategy);

        $container = self::getContainerBuilder()
            ->add(TranslatorInterface::class, $this->translator)
            ->add('oro_calendar.model.recurrence', $this->recurrenceModel)
            ->getContainer($this);

        $this->extension = new RecurrenceExtension($container);
    }

    public function testGetRecurrenceTextValue()
    {
        $this->strategy->expects($this->once())
            ->method('getTextValue')
            ->willReturn('test_pattern');

        $this->assertEquals(
            'test_pattern',
            self::callTwigFunction($this->extension, 'get_recurrence_text_value', [new Entity\Recurrence()])
        );
    }

    public function testGetRecurrenceTextValueWithNA()
    {
        $this->translator->expects($this->once())
            ->method('trans')
            ->willReturn('N/A');

        $this->assertEquals(
            'N/A',
            self::callTwigFunction($this->extension, 'get_recurrence_text_value', [null])
        );
    }
}
